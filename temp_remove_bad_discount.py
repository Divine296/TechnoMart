from pathlib import Path
path = Path(r"C:\Users\Divine Quijano\updatedmobileweb-main\backend\api\views_orders.py")
text = path.read_text()
old_block = "        discount = max(Decimal(\"0\"), discount)\r\n        total = max(Decimal(\"0\"), subtotal - discount)\r\n\r\n"
if old_block not in text:
    raise SystemExit('old discount block not found')
text = text.replace(old_block, '')
path.write_text(text)
