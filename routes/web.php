<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
    Route::patch('clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
    Route::post('clients/{client}/devices', [ClientController::class, 'addDevice'])->name('clients.devices.store');
    Route::patch('devices/{device}', [ClientController::class, 'updateDevice'])->name('devices.update');
    Route::delete('devices/{device}', [ClientController::class, 'deleteDevice'])->name('devices.destroy');
    
    // API Token Management
    Route::post('clients/{client}/api-tokens', [ClientController::class, 'generateApiToken'])->name('clients.api-tokens.store');
    Route::patch('api-tokens/{apiToken}/revoke', [ClientController::class, 'revokeApiToken'])->name('api-tokens.revoke');
    Route::delete('api-tokens/{apiToken}', [ClientController::class, 'deleteApiToken'])->name('api-tokens.destroy');

    Route::get('events', [EventController::class, 'index'])->name('events.index');
});

require __DIR__.'/settings.php';
