import json
import urllib.request
import pathlib

path = pathlib.Path('.env.local')
if not path.exists():
    raise SystemExit('.env.local not found')

env = {}
with path.open('r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, val = line.split('=', 1)
        env[key] = val

url = env['VITE_SUPABASE_URL'].rstrip('/')
key = env['VITE_SUPABASE_ANON_KEY']
headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}
user_id = '49c93da4-6f1d-46c7-81df-b304971866de'
queries = [
    ('admin_users', f"/rest/v1/admin_users?select=id,role,active,email&eq(id,'{user_id}')", 'GET', None),
    ('is_admin', '/rest/v1/rpc/is_admin', 'POST', json.dumps({})),
]
for name, path_tail, method, data in queries:
    req = urllib.request.Request(url + path_tail, data=data.encode('utf-8') if data else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode('utf-8')
            print('---', name, '---')
            print(body)
    except urllib.error.HTTPError as e:
        print('---', name, 'HTTP ERROR', e.code)
        print(e.read().decode('utf-8'))
    except Exception as e:
        print('---', name, 'ERROR ---')
        print(type(e).__name__, e)
