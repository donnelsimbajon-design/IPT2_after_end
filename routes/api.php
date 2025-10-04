<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;

Route::post('/register', [ProfileController::class, 'store']);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('/profiles', [ProfileController::class, 'index']);
Route::post('/profiles', [ProfileController::class, 'store']);

// support both PUT and PATCH for updates
Route::put('/profiles/{id}', [ProfileController::class, 'update']);
Route::patch('/profiles/{id}', [ProfileController::class, 'update']);

Route::delete('/profiles/{id}', [ProfileController::class, 'destroy']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
