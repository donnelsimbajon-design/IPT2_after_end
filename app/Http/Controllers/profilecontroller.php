<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json(Profile::orderBy('id', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'fname'   => 'required|string|max:255',
            'lname'   => 'nullable|string|max:255',
            'email'   => 'nullable|email|max:255|unique:profiles,email',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city'    => 'nullable|string|max:255',
            'state'   => 'nullable|string|max:255',
            'zip'     => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
        ]);

        try {
            $profile = \App\Models\Profile::create($data);
            return response()->json(['profile' => $profile], 201);
        } catch (\Throwable $e) {
            \Log::error('Profile store error: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Server error creating profile',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function show(Profile $profile)
    {
        // Fetch all profiles from the database
        $profiles = Profile::all();


        // Return profiles as JSON
        return response()->json($profiles);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);

        $rules = [
            'fname'   => 'sometimes|required|string|max:255',
            'lname'   => 'sometimes|nullable|string|max:255',
            'email'   => 'sometimes|nullable|email|max:255',
            'phone'   => 'sometimes|nullable|string|max:50',
            'address' => 'sometimes|nullable|string|max:500',
            'city'    => 'sometimes|nullable|string|max:255',
            'state'   => 'sometimes|nullable|string|max:255',
            'zip'     => 'sometimes|nullable|string|max:50',
            'country' => 'sometimes|nullable|string|max:255',
        ];

        $data = $request->validate($rules);

        $profile->update($data);

        return response()->json(['profile' => $profile]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();

        return response()->json(null, 204);
    }
}