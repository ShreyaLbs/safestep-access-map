import io

with io.open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace corrupted characters
text = text.replace('â”€', '─')
text = text.replace('â€”', '—')

# Also handle the replacement characters seen earlier if needed, but '?' might be hard.
# Actually powershell output `?` if the console code page was 437. 
# But in `app.js` itself (which I viewed with view_file tool), it contains UTF-8 bytes for 'â”€' because view_file reads it as UTF-8 and sees it correctly.

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Replaced characters.')
