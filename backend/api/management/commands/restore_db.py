import os
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Restore a MySQL dump using the mysql client (requires mysql on PATH)."

    def add_arguments(self, parser):
        parser.add_argument("path", type=str, help="Path to SQL dump produced by mysqldump")

    def handle(self, *args, **options):
        db = settings.DATABASES.get("default", {})
        engine = db.get("ENGINE", "")
        if "mysql" not in engine:
            raise CommandError("MySQL restore is supported only for MySQL engines.")

        dump_path = Path(options["path"]).expanduser().resolve()
        if not dump_path.exists():
            raise CommandError(f"Backup not found: {dump_path}")

        name = db.get("NAME")
        user = db.get("USER")
        password = db.get("PASSWORD", "")
        host = db.get("HOST", "127.0.0.1")
        port = str(db.get("PORT") or "3306")

        cmd = [
            "mysql",
            f"--host={host}",
            f"--port={port}",
            f"--user={user}",
            name,
        ]

        env = os.environ.copy()
        if password:
            env["MYSQL_PWD"] = password

        self.stdout.write(self.style.WARNING("Restoring database will overwrite existing data."))
        self.stdout.write(self.style.HTTP_INFO(f"Importing {dump_path} into '{name}'"))
        try:
            with dump_path.open("rb") as fh:
                subprocess.run(cmd, check=True, env=env, stdin=fh)
        except FileNotFoundError as exc:
            raise CommandError("mysql client not found on PATH. Install MySQL client tools.") from exc
        except subprocess.CalledProcessError as exc:
            raise CommandError(f"mysql restore failed with exit code {exc.returncode}") from exc

        self.stdout.write(self.style.SUCCESS("Restore complete."))
