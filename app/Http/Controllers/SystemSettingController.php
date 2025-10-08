<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SystemSettingController extends Controller
{
    /**
     * Display a listing of system settings
     */
    public function index()
    {
        $settings = SystemSetting::orderBy('category')->orderBy('setting_key')->get();
        return response()->json($settings);
    }

    /**
     * Store a newly created setting
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'setting_key' => 'required|string|unique:system_settings,setting_key',
            'setting_value' => 'nullable|string',
            'setting_type' => 'required|in:text,number,boolean,json',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        try {
            $setting = SystemSetting::create($data);
            return response()->json(['setting' => $setting, 'message' => 'Setting created successfully'], 201);
        } catch (\Throwable $e) {
            \Log::error('System setting store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating setting',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified setting
     */
    public function show($id)
    {
        $setting = SystemSetting::findOrFail($id);
        return response()->json($setting);
    }

    /**
     * Update the specified setting
     */
    public function update(Request $request, $id)
    {
        $setting = SystemSetting::findOrFail($id);

        $data = $request->validate([
            'setting_key' => 'sometimes|required|string|unique:system_settings,setting_key,' . $id,
            'setting_value' => 'sometimes|nullable|string',
            'setting_type' => 'sometimes|required|in:text,number,boolean,json',
            'category' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'is_public' => 'sometimes|nullable|boolean',
        ]);

        $setting->update($data);
        return response()->json(['setting' => $setting, 'message' => 'Setting updated successfully']);
    }

    /**
     * Remove the specified setting
     */
    public function destroy($id)
    {
        $setting = SystemSetting::findOrFail($id);
        $setting->delete();
        return response()->json(['message' => 'Setting deleted successfully'], 200);
    }

    /**
     * Get setting by key
     */
    public function getByKey($key)
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();
        return response()->json($setting);
    }

    /**
     * Update setting by key
     */
    public function updateByKey(Request $request, $key)
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();
        
        $data = $request->validate([
            'setting_value' => 'required|string',
        ]);

        $setting->update($data);
        return response()->json(['setting' => $setting, 'message' => 'Setting updated successfully']);
    }
}
