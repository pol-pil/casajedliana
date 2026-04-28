C:\Users\JEDLIAN\Desktop\casajedliana>npm run dev

> dev
> vite

error when starting dev server:
Error: Error generating types: Error: Command failed: php artisan wayfinder:generate --with-form
PHP Fatal error:  Uncaught RuntimeException: Composer detected issues in your platform: Your Composer dependencies require a PHP version ">= 8.4.0". You are running 8.1.25. in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php:22
Stack trace:
#0 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\autoload_real.php(25): require()
#1 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\autoload.php(22): ComposerAutoloaderInit3c79e040a3570288a4004f205416801a::getLoader()
#2 C:\Users\JEDLIAN\Desktop\casajedliana\artisan(10): require('C:\\Users\\JEDLIA...')
#3 {main}
  thrown in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php on line 22

    at PluginContext._formatLog (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:28999:43)
    at PluginContext.error (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:28996:14)
    at runCommand (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/@laravel/vite-plugin-wayfinder/dist/index.mjs:2101:15)
    at async Promise.all (index 2)
    at async EnvironmentPluginContainer.hookParallel (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:28661:3)
    at async EnvironmentPluginContainer.buildStart (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:28671:3)
    at async file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:25633:4
    at async httpServer.listen (file:///C:/Users/JEDLIAN/Desktop/casajedliana/node_modules/vite/dist/node/chunks/config.js:25644:5)
