# python3 oai.py <out.png> <size> "<prompt>" [model] — OpenAI image, transparent background
import json, sys, base64, urllib.request, time
key=[l.split('=',1)[1].strip().strip('"') for l in open('/Users/jonas/Documents/Files/Projects/SimpliServ/laravel-suite/.env') if l.startswith('OPENAI_API_KEY=')][0]
out,size,prompt=sys.argv[1:4]; model=sys.argv[4] if len(sys.argv)>4 else "gpt-image-1.5"
body={"model":model,"prompt":prompt,"size":size,"background":"transparent","output_format":"png","quality":"high","n":1}
for attempt in range(3):
    r=urllib.request.Request("https://api.openai.com/v1/images/generations",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","Authorization":"Bearer "+key})
    try:
        d=json.loads(urllib.request.urlopen(r,timeout=400).read())
        open(out,'wb').write(base64.b64decode(d['data'][0]['b64_json'])); print('ok',out); sys.exit()
    except urllib.error.HTTPError as e: print('err',e.code,e.read()[:300].decode()); 
    except Exception as e: print('err',e)
    time.sleep(5)
sys.exit(1)
