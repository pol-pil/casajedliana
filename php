

C:\Users\JEDLIAN\Desktop\casajedliana>php.exe artisan serve
PHP Fatal error:  Uncaught RuntimeException: Composer detected issues in your platform: Your Composer dependencies require a PHP version ">= 8.4.0". You are running 8.1.25. in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php:22
Stack trace:
#0 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\autoload_real.php(25): require()
#1 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\autoload.php(22): ComposerAutoloaderInit3c79e040a3570288a4004f205416801a::getLoader()
#2 C:\Users\JEDLIAN\Desktop\casajedliana\artisan(10): require('C:\\Users\\JEDLIA...')
#3 {main}
  thrown in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php on line 22

Fatal error: Uncaught RuntimeException: Composer detected issues in your platform: Your Composer dependencies require a PHP version ">= 8.4.0". You are running 8.1.25. in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php:22
Stack trace:
#0 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\autoload_real.php(25): require()
#1 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\autoload.php(22): ComposerAutoloaderInit3c79e040a3570288a4004f205416801a::getLoader()
#2 C:\Users\JEDLIAN\Desktop\casajedliana\artisan(10): require('C:\\Users\\JEDLIA...')
#3 {main}
  thrown in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php on line 22

C:\Users\JEDLIAN\Desktop\casajedliana>C:\php\php.exe -v
'C:\php\php.exe' is not recognized as an internal or external command,
operable program or batch file.


C:\Users\JEDLIAN\Desktop\casajedliana>C:\php82\php.exe artisan serve

Fatal error: Uncaught RuntimeException: Composer detected issues in your platform: Your Composer dependencies require a PHP version ">= 8.4.0". You are running 8.2.30. in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php:22
Stack trace:
#0 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\autoload_real.php(25): require()
#1 C:\Users\JEDLIAN\Desktop\casajedliana\vendor\autoload.php(22): ComposerAutoloaderInit3c79e040a3570288a4004f205416801a::getLoader()
#2 C:\Users\JEDLIAN\Desktop\casajedliana\artisan(10): require('C:\\Users\\JEDLIA...')
#3 {main}
  thrown in C:\Users\JEDLIAN\Desktop\casajedliana\vendor\composer\platform_check.php on line 22

C:\Users\JEDLIAN\Desktop\casajedliana>
