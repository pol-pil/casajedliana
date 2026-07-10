<?php

test('system documentation file exists and lists core pages', function (): void {
    $path = base_path('SYSTEM_DOCUMENTATION.txt');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->not->toBeFalse()
        ->and($contents)->toContain('CASA JEDLIANA SYSTEM DOCUMENTATION')
        ->and($contents)->toContain('/dashboard')
        ->and($contents)->toContain('/bookings')
        ->and($contents)->toContain('/rooms')
        ->and($contents)->toContain('/admin/users')
        ->and($contents)->toContain('/settings/profile');
});

test('page by page documentation file exists and excludes settings and laravel defaults', function (): void {
    $path = base_path('PAGE_BY_PAGE_DOCUMENTATION.txt');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)->not->toBeFalse()
        ->and($contents)->toContain('CASA JEDLIANA PAGE-BY-PAGE DOCUMENTATION')
        ->and($contents)->toContain('/dashboard')
        ->and($contents)->toContain('/bookings')
        ->and($contents)->toContain('/rooms')
        ->and($contents)->toContain('/reports/charts')
        ->and($contents)->toContain('/admin/hotel-info')
        ->and($contents)->toContain('Server-side data flow:')
        ->and($contents)->toContain('Important frontend state:')
        ->and($contents)->toContain('Important server actions/endpoints tied to the page:')
        ->and($contents)->toContain('Technical notes:')
        ->and($contents)->not->toContain('/settings/profile')
        ->and($contents)->not->toContain('/settings/password')
        ->and($contents)->not->toContain('resources/js/pages/welcome.tsx')
        ->and($contents)->not->toContain('resources/js/pages/auth/login.tsx');
});
