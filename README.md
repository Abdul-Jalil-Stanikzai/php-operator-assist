# PHP Operator Assist

Type `.` immediately after a PHP object variable or object chain and the extension replaces it with `->`. Type it after a class name or PHP static keyword and it inserts `::`. It works in PHP files and Laravel Blade files.

```php
$user.             // becomes $user->
$user->profile.    // becomes $user->profile->
$user?->profile.   // becomes $user?->profile->
User.              // becomes User::
Route.             // becomes Route::
App\Models\User.  // becomes App\Models\User::
self.              // becomes self::
```

The default behavior leaves a dot alone when whitespace comes before it, which preserves the usual PHP string concatenation style:

```php
$message = $first . $second;
```

It also avoids dots inside strings and comments. Class detection follows PHP naming conventions: a class-like name whose final segment starts with an uppercase letter, plus `self`, `static`, and `parent`, becomes `::`. Lowercase class aliases are ambiguous with functions, so they are left unchanged.

The icon shows both supported conversions: `.` to `->` for objects and `.` to `::` for classes.

## Settings

- `phpDotToArrow.enabled`: enable or disable conversion (default `true`).
- `phpDotToArrow.onlyWithoutWhitespace`: only convert when the dot directly follows the expression (default `true`).

The whitespace setting is a heuristic. If disabled, a spaced concatenation expression such as `$first . $second` may be converted when typing its dot.

## Run and test

Open this folder in VS Code, press `F5`, and type a dot after a PHP variable in the Extension Development Host. Run `npm test` to check the conversion rules.

## Install from the VSIX

In VS Code, open the Extensions view, choose **...** → **Install from VSIX...**, and select `php-operator-assist-0.1.3.vsix`.
