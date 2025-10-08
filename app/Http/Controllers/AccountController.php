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
        return response()->json([
            'user' => $user,
            'avatar_url' => $avatarUrl,
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
}
