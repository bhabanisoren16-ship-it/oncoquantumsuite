import sys, json, os, urllib.request
API_KEY = os.environ.get('STITCH_API_KEY', '')
URL = os.environ.get('STITCH_MCP_URL', 'https://stitch.googleapis.com/mcp')
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    req = json.loads(line)
    req_id = req.get('id')
    headers = {'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY}
    http_req = urllib.request.Request(URL, data=line.encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(http_req) as resp:
            data = resp.read().decode('utf-8')
            if req_id is not None and data:
                sys.stdout.write(data.strip() + '\n')
                sys.stdout.flush()
    except Exception as e:
        if req_id is not None:
            sys.stdout.write(json.dumps({'jsonrpc': '2.0', 'id': req_id, 'error': {'code': -32603, 'message': str(e)}}) + '\n')
            sys.stdout.flush()
