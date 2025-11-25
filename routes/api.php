<?php

use App\Http\Controllers\Api\ClientDataController;
use App\Http\Controllers\Api\EventController;
use App\Http\Middleware\AuthenticateApiToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public route for receiving events from HikVision devices
Route::post('/events', [EventController::class, 'store'])->name('events.store');

// Protected API routes for clients
Route::middleware([AuthenticateApiToken::class])->prefix('v1')->group(function () {
    Route::get('/events', [ClientDataController::class, 'getEvents'])->name('api.events');
    Route::get('/daily-attendance', [ClientDataController::class, 'getDailyAttendance'])->name('api.daily-attendance');
    Route::get('/devices', [ClientDataController::class, 'getDevices'])->name('api.devices');
    Route::get('/statistics', [ClientDataController::class, 'getStatistics'])->name('api.statistics');
    Route::get('/today-stats', [ClientDataController::class, 'getTodayStats'])->name('api.today-stats');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
