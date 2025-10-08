<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // use web guard explicitly and allow "remember" if passed
        $remember = $request->boolean('remember', false);

        if (Auth::guard('web')->attempt($credentials, $remember)) {
            $request->session()->regenerate();
            $user = $request->user();
            // record last login ip and timestamp
            if ($user) {
                $user->last_login_ip = $request->ip();
                $user->last_login_at = now();
                $user->save();
            }
            return response()->json(['message' => 'ok', 'user' => $user], 200);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'logged_out'], 200);
    }

    public function check(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'authenticated' => true,
                'user' => $request->user()
            ], 200);
        }
        
        return response()->json(['authenticated' => false], 401);
    }
}