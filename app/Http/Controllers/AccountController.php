<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        $avatarUrl = $user && $user->avatar_path ? asset($user->avatar_path) : null;
        $bgUrl = $user && $user->bg_image_path ? asset($user->bg_image_path) : null;
        return response()->json([
            'user' => $user,
            'avatar_url' => $avatarUrl,
            'bg_image_url' => $bgUrl,
            'theme_mode' => $user?->theme_mode,
            'theme_color' => $user?->theme_color,
            'current_ip' => $request->ip(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
        ]);
        $user->update($data);
        return response()->json(['user' => $user, 'message' => 'Profile updated']);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120', // 5MB
        ]);

        $user = $request->user();
        $file = $request->file('avatar');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/avatars');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);
        // delete old avatar if exists and is under uploads/avatars
        if ($user->avatar_path && str_starts_with($user->avatar_path, 'uploads/avatars/') && file_exists(public_path($user->avatar_path))) {
            @unlink(public_path($user->avatar_path));
        }
        $user->avatar_path = 'uploads/avatars/' . $filename;
        $user->save();

        return response()->json([
            'user' => $user,
            'avatar_url' => asset($user->avatar_path),
            'message' => 'Avatar uploaded successfully'
        ]);
    }

    public function updateAppearance(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'theme_mode' => 'nullable|in:light,dark',
            'theme_color' => 'nullable|string|max:20',
            'clear_bg' => 'nullable|boolean',
        ]);
        if (array_key_exists('theme_mode', $data)) {
            $user->theme_mode = $data['theme_mode'];
        }
        if (array_key_exists('theme_color', $data)) {
            $user->theme_color = $data['theme_color'];
        }
        if ($request->boolean('clear_bg')) {
            if ($user->bg_image_path && str_starts_with($user->bg_image_path, 'uploads/backgrounds/') && file_exists(public_path($user->bg_image_path))) {
                @unlink(public_path($user->bg_image_path));
            }
            $user->bg_image_path = null;
        }
        $user->save();
        return response()->json(['user' => $user, 'message' => 'Appearance updated']);
    }

    public function uploadBackground(Request $request)
    {
        $request->validate([
            'bg_image' => 'required|image|max:10240', // 10MB
        ]);

        $user = $request->user();
        $file = $request->file('bg_image');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/backgrounds');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);

        // delete old background if stored in our uploads dir
        if ($user->bg_image_path && str_starts_with($user->bg_image_path, 'uploads/backgrounds/') && file_exists(public_path($user->bg_image_path))) {
            @unlink(public_path($user->bg_image_path));
        }

        $user->bg_image_path = 'uploads/backgrounds/' . $filename;
        $user->save();

        return response()->json([
            'user' => $user,
            'bg_image_url' => asset($user->bg_image_path),
            'message' => 'Background updated',
        ]);
    }
}
