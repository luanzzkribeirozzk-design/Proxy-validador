import os

def patch_binary(file_path, old_url, new_url):
    new_url_bytes = new_url.encode('utf-8')
    padding = b'\x00' * (len(old_url) - len(new_url))
    replacement = new_url_bytes + padding

    with open(file_path, 'rb') as f:
        content = f.read()
    
    if old_url.encode('utf-8') in content:
        new_content = content.replace(old_url.encode('utf-8'), replacement)
        with open(file_path, 'wb') as f:
            f.write(new_content)
        return True
    return False

old_url = "https://geradordelta.up.railway.app/CheckLogin.php?"
new_url = "https://proxy-validador.vercel.app/check?"

# Extrair as libs, aplicar patch e colocar de volta
os.system("unzip -o Proxy_Vercel.apk lib/arm64-v8a/libKINGZADA.so lib/armeabi-v7a/libKINGZADA.so")
patch_binary("lib/arm64-v8a/libKINGZADA.so", old_url, new_url)
patch_binary("lib/armeabi-v7a/libKINGZADA.so", old_url, new_url)
os.system("zip -ur Proxy_Vercel.apk lib/arm64-v8a/libKINGZADA.so lib/armeabi-v7a/libKINGZADA.so")
