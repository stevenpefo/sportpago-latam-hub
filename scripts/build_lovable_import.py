#!/usr/bin/env python3
"""Create a source-only Lovable import ZIP without database migrations or credentials.

This intentionally excludes the production APK configuration, GitHub actions,
existing Supabase migrations, SQL scripts, and all .env files. The new Lovable
project must be connected manually; importing alone cannot alter production.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

root = Path(__file__).resolve().parents[1]
output_dir = root / "build-output"
output_dir.mkdir(exist_ok=True)
output = output_dir / "sportpago-internacional-lovable-import.zip"
dirs = ["src", "public"]
files = [
    "index.html", "package.json", "package-lock.json", "vite.config.ts",
    "components.json", "postcss.config.js", "tailwind.config.ts",
    "eslint.config.js", "tsconfig.json", "tsconfig.app.json",
    "tsconfig.node.json",
]
manifest = """# SportPago Internacional — Source import only

This is an isolated Lovable web preview package, not an APK or a database dump.
It does NOT include database migrations, access keys, payment data, or athletes.

IMPORTANT:
- Import as a NEW Lovable project, named SportPago Internacional - Pruebas.
- NEVER import into or overwrite the Lovable project currently serving Colombia.
- The original Lovable project and its published website stay unchanged.
- Do NOT ask Lovable to create, migrate or change database tables.
- Connect ONLY the already-verified Supabase project via Lovable's connector.
- The source uses Vite env vars; these must be supplied securely in the NEW
  project: VITE_DEPLOY_TARGET=preview-shared,
  VITE_ENABLE_CLUB_INVITES=true,
  VITE_SUPABASE_PROJECT_ID=<verified project ref>,
  VITE_SUPABASE_URL=https://<verified project ref>.supabase.co,
  VITE_SUPABASE_PUBLISHABLE_KEY=<anon/public key; NEVER secret/service_role>.
- The current SQL already installed the two required tables in the existing DB.
- Use fictional registrations; this is NOT ready to accept real minors' data.
- The public link should remain limited to internal testing until functional
  and security reviews are complete.
"""
with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as z:
    z.writestr("IMPORT_INSTRUCTIONS.md", manifest)
    for folder in dirs:
        base = root / folder
        assert base.is_dir(), f"Missing source directory: {folder}"
        for p in sorted(base.rglob("*")):
            if p.is_file():
                assert ".env" not in p.parts and "node_modules" not in p.parts
                z.write(p, p.relative_to(root).as_posix())
    for file in files:
        p = root / file
        assert p.is_file(), f"Missing required root source file: {file}"
        z.write(p, p.relative_to(root).as_posix())
with ZipFile(output) as z:
    paths = z.namelist()
    forbidden = ("supabase/", ".env", ".github/", "capacitor.config", ".lovable/", "docs/sql/")
    for p in paths:
        if any(p.startswith(x) for x in forbidden):
            sys.exit(f"Unexpected sensitive or backend file in import: {p}")
    assert "src/pages/JoinClub.tsx" in paths
    assert "src/components/athletes/ClubSelfRegistration.tsx" in paths
    assert "src/integrations/supabase/client.ts" in paths
    print(f"Created safe source-only ZIP: {output.name}, {len(paths)} files, {output.stat().st_size} bytes")
