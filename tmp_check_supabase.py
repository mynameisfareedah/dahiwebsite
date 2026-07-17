import re
import urllib.request
import urllib.error
from pathlib import Path

env = Path('.env.local').read_text()
url = re.search(r'VITE_SUPABASE_URL=(.*)', env).group(1).strip().rstrip('/')
key = re.search(r'VITE_SUPABASE_ANON_KEY=(.*)', env).group(1).strip()
headers = {'apikey': key, 'Authorization': 'Bearer ' + key, 'Accept': 'application/json'}

for endpoint in ['/storage/v1/bucket', '/rest/v1/events?select=id,poster_url&limit=10']:
    req = urllib.request.Request(url + endpoint, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            print('ENDPOINT', endpoint, 'STATUS', res.status)
            print(res.read().decode())
    except urllib.error.HTTPError as e:
        print('ENDPOINT', endpoint, 'HTTP ERROR', e.code)
        try:
            print(e.read().decode())
        except Exception:
            pass
    except Exception as e:
        print('ENDPOINT', endpoint, 'ERROR', e)
