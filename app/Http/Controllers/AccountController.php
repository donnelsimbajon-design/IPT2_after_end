<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\LoginActivity;

class AccountController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $avatarUrl = $user && $user->avatar_path ? asset($user->avatar_path) : null;
        $bgUrl = $user && $user->bg_image_path ? asset($user->bg_image_path) : null;
        $currentUa = $request->header('User-Agent');
        $currentDevice = $this->parseUserAgent($currentUa);
        $lastDevice = $this->parseUserAgent($user->last_login_user_agent ?? '');
        return response()->json([
            'user' => $user,
            'avatar_url' => $avatarUrl,
            'bg_image_url' => $bgUrl,
            'theme_mode' => $user->theme_mode ?? null,
            'theme_color' => $user->theme_color ?? null,
            'current_ip' => $request->ip(),
            'current_user_agent' => $currentUa,
            'current_device' => $currentDevice,
            'last_login_device' => $lastDevice,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes','required','email', Rule::unique('users', 'email')->ignore($user->id)],
            'course' => 'sometimes|nullable|string|max:255',
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
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $file = $request->file('avatar');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/avatars');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);
        // delete old avatar if exists and is under uploads/avatars
        if ($user->avatar_path && strpos($user->avatar_path, 'uploads/avatars/') === 0 && file_exists(public_path($user->avatar_path))) {
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
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
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
            if ($user->bg_image_path && strpos($user->bg_image_path, 'uploads/backgrounds/') === 0 && file_exists(public_path($user->bg_image_path))) {
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
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $file = $request->file('bg_image');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $targetDir = public_path('uploads/backgrounds');
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0775, true);
        }
        $file->move($targetDir, $filename);

        // delete old background if stored in our uploads dir
        if ($user->bg_image_path && strpos($user->bg_image_path, 'uploads/backgrounds/') === 0 && file_exists(public_path($user->bg_image_path))) {
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

    public function history(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $items = LoginActivity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        $data = $items->map(function ($a) {
            return [
                'id' => $a->id,
                'ip_address' => $a->ip_address,
                'user_agent' => $a->user_agent,
                'device' => $this->parseUserAgent($a->user_agent),
                'created_at' => $a->created_at,
            ];
        });
        return response()->json(['history' => $data]);
    }

    private function parseUserAgent(?string $ua): array
    {
        $ua = $ua ?? '';
        $deviceType = 'Desktop';
        if (stripos($ua, 'Mobile') !== false || stripos($ua, 'Android') !== false || stripos($ua, 'iPhone') !== false) {
            $deviceType = 'Mobile';
        } elseif (stripos($ua, 'iPad') !== false || stripos($ua, 'Tablet') !== false) {
            $deviceType = 'Tablet';
        }

        $os = 'Unknown OS';
        if (stripos($ua, 'Windows') !== false) $os = 'Windows';
        elseif (stripos($ua, 'Mac OS') !== false || stripos($ua, 'Macintosh') !== false) $os = 'macOS';
        elseif (stripos($ua, 'Linux') !== false) $os = 'Linux';
        elseif (stripos($ua, 'Android') !== false) $os = 'Android';
        elseif (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) $os = 'iOS';

        $browser = 'Unknown Browser';
        if (stripos($ua, 'Edg') !== false) $browser = 'Edge';
        elseif (stripos($ua, 'Chrome') !== false) $browser = 'Chrome';
        elseif (stripos($ua, 'Safari') !== false) $browser = 'Safari';
        elseif (stripos($ua, 'Firefox') !== false) $browser = 'Firefox';
        elseif (stripos($ua, 'MSIE') !== false || stripos($ua, 'Trident') !== false) $browser = 'IE';

        return [
            'device_type' => $deviceType,
            'os' => $os,
            'browser' => $browser,
            'label' => trim($deviceType . ' • ' . $os . ' • ' . $browser),
        ];
    }
}
