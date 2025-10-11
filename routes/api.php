<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\SchoolYearController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [ProfileController::class, 'store']);

// Protected routes - require authentication
Route::middleware(['auth:web'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth/check', [AuthController::class, 'check']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Account routes
    Route::get('/account/profile', [AccountController::class, 'profile']);
    Route::put('/account/profile', [AccountController::class, 'update']);
    Route::post('/account/avatar', [AccountController::class, 'uploadAvatar']);
    Route::put('/account/appearance', [AccountController::class, 'updateAppearance']);
    Route::post('/account/background', [AccountController::class, 'uploadBackground']);

    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);

    // Student routes
    Route::get('/students', [StudentController::class, 'index']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::get('/students/archived', [StudentController::class, 'archived']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}', [StudentController::class, 'update']);
    Route::patch('/students/{id}', [StudentController::class, 'update']);
    Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    Route::post('/students/{id}/avatar', [StudentController::class, 'uploadAvatar']);
    Route::post('/students/{id}/archive', [StudentController::class, 'archive']);
    Route::post('/students/{id}/unarchive', [StudentController::class, 'unarchive']);

    // Faculty routes
    Route::get('/faculties', [FacultyController::class, 'index']);
    Route::post('/faculties', [FacultyController::class, 'store']);
    Route::get('/faculties/archived', [FacultyController::class, 'archived']);
    Route::get('/faculties/{id}', [FacultyController::class, 'show']);
    Route::put('/faculties/{id}', [FacultyController::class, 'update']);
    Route::patch('/faculties/{id}', [FacultyController::class, 'update']);
    Route::delete('/faculties/{id}', [FacultyController::class, 'destroy']);
    Route::post('/faculties/{id}/avatar', [FacultyController::class, 'uploadAvatar']);
    Route::post('/faculties/{id}/archive', [FacultyController::class, 'archive']);
    Route::post('/faculties/{id}/unarchive', [FacultyController::class, 'unarchive']);

    // Report routes
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::post('/reports/generate', [ReportController::class, 'generate']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::patch('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);

    // System Settings routes
    Route::get('/settings', [SystemSettingController::class, 'index']);
    Route::post('/settings', [SystemSettingController::class, 'store']);
    Route::get('/settings/{id}', [SystemSettingController::class, 'show']);
    Route::put('/settings/{id}', [SystemSettingController::class, 'update']);
    Route::patch('/settings/{id}', [SystemSettingController::class, 'update']);
    Route::delete('/settings/{id}', [SystemSettingController::class, 'destroy']);
    Route::get('/settings/key/{key}', [SystemSettingController::class, 'getByKey']);
    Route::put('/settings/key/{key}', [SystemSettingController::class, 'updateByKey']);

    // Profile routes (existing)
    Route::get('/profiles', [ProfileController::class, 'index']);
    Route::post('/profiles', [ProfileController::class, 'store']);
    Route::put('/profiles/{id}', [ProfileController::class, 'update']);
    Route::patch('/profiles/{id}', [ProfileController::class, 'update']);
    Route::delete('/profiles/{id}', [ProfileController::class, 'destroy']);

    // Archive routes
    Route::get('/archives', [ArchiveController::class, 'index']);
    Route::post('/archives', [ArchiveController::class, 'store']);
    Route::get('/archives/{id}', [ArchiveController::class, 'show']);
    Route::put('/archives/{id}', [ArchiveController::class, 'update']);
    Route::patch('/archives/{id}', [ArchiveController::class, 'update']);
    Route::delete('/archives/{id}', [ArchiveController::class, 'destroy']);
    Route::post('/archives/{id}/upload', [ArchiveController::class, 'uploadFile']);

    // School Year routes
    Route::get('/school-years', [SchoolYearController::class, 'index']);
    Route::post('/school-years', [SchoolYearController::class, 'store']);
    Route::get('/school-years/{id}', [SchoolYearController::class, 'show']);
    Route::put('/school-years/{id}', [SchoolYearController::class, 'update']);
    Route::patch('/school-years/{id}', [SchoolYearController::class, 'update']);
    Route::delete('/school-years/{id}', [SchoolYearController::class, 'destroy']);
    Route::post('/school-years/{id}/archive', [SchoolYearController::class, 'archive']);
    Route::post('/school-years/{id}/unarchive', [SchoolYearController::class, 'unarchive']);

    // Semesters under a school year
    Route::post('/school-years/{id}/semesters', [SchoolYearController::class, 'addSemester']);
    Route::put('/school-years/{id}/semesters/{semesterId}', [SchoolYearController::class, 'updateSemester']);
    Route::patch('/school-years/{id}/semesters/{semesterId}', [SchoolYearController::class, 'updateSemester']);
    Route::delete('/school-years/{id}/semesters/{semesterId}', [SchoolYearController::class, 'deleteSemester']);

    // Attach/detach students to a school year
    Route::post('/school-years/{id}/students', [SchoolYearController::class, 'attachStudent']);
    Route::delete('/school-years/{id}/students', [SchoolYearController::class, 'detachStudent']);
});
