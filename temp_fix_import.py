from pathlib import Path
path = Path(r"C:\Users\Divine Quijano\updatedmobileweb-main\src\components\pos\OrderQueue.jsx")
text = path.read_text()
old = "import React, {\r\n  useMemo,\r\n  useState,\r\n  useEffect,\r\n  useCallback,\r\n  useRef,\r\n} from 'react';\r\n"
new = "import React, {\r\n  useMemo,\r\n  useState,\r\n  useEffect,\r\n  useCallback,\r\n} from 'react';\r\n"
if old not in text:
    raise SystemExit('import block not found')
text = text.replace(old, new, 1)
path.write_text(text)
