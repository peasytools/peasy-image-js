Output demo.gif

Set Shell zsh
Set Width 900
Set Height 550
Set FontSize 14
Set Padding 15
Set TypingSpeed 40ms

Type `node`
Enter
Sleep 1s

Type `const img = await import('./dist/index.js')`
Enter
Sleep 1s

Type `// 15 image operations available`
Enter
Sleep 300ms
Type `Object.keys(img).filter(k => typeof img[k] === 'function')`
Enter
Sleep 1.5s

Type `// Get image info`
Enter
Sleep 300ms
Type `await img.info('demo.gif')`
Enter
Sleep 1.5s

Type `// Resize — returns Buffer`
Enter
Sleep 300ms
Type `const resized = await img.resize('demo.gif', { width: 200 })`
Enter
Sleep 1s
Type `'Resized: ' + resized.length + ' bytes'`
Enter
Sleep 1.5s

Type `// Convert format`
Enter
Sleep 300ms
Type `const webp = await img.convert('demo.gif', { format: 'webp' })`
Enter
Sleep 1s
Type `'WebP: ' + webp.length + ' bytes'`
Enter
Sleep 1.5s

Type `.exit`
Enter
Sleep 500ms
