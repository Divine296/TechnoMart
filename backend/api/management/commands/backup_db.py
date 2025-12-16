import os
import subprocess
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create a MySQL dump using mysqldump (requires mysqldump on PATH)."

    def handle(self, *args, **options):
        db = settings.DATABASES.get("default", {})
        engine = db.get("ENGINE", "")
        if "mysql" not in engine:
            raise CommandError("mysqldump export is supported only for MySQL engines.")

        name = db.get("NAME")
        user = db.get("USER")
        password = db.get("PASSWORD", "")
        host = db.get("HOST", "127.0.0.1")
        port = str(db.get("PORT") or "3306")

        backups_dir = Path(settings.BASE_DIR) / "backups"
        backups_dir.mkdir(exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        dump_path = backups_dir / f"{name}-{timestamp}.sql"

        cmd = [
            "mysqldump",
            f"--host={host}",
            f"--port={port}",
            f"--user={user}",
            "--single-transaction",
            "--routines",
            "--triggers",
            name,
        ]

        env = os.environ.copy()
        if password:
            env["MYSQL_PWD"] = password

        self.stdout.write(self.style.HTTP_INFO(f"Dumping MySQL database '{name}' to {dump_path}"))
        try:
            with open(dump_path, "wb") as fh:
                subprocess.run(cmd, check=True, env=env, stdout=fh)
        except FileNotFoundError as exc:
            raise CommandError("mysqldump not found on PATH. Install MySQL client tools.") from exc
        except subprocess.CalledProcessError as exc:
            raise CommandError(f"mysqldump failed with exit code {exc.returncode}") from exc

        self.stdout.write(self.style.SUCCESS(f"Backup created: {dump_path}"))
