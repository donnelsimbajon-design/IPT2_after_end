<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Archive;
use Illuminate\Support\Facades\Storage;

class ArchiveController extends Controller
{
    /**
     * Display a listing of archives
     */
    public function index(Request $request)
    {
        $query = Archive::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by document type
        if ($request->has('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('archive_id', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        $archives = $query->orderBy('created_at', 'desc')->get();
        return response()->json($archives);
    }

    /**
     * Store a newly created archive
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'archive_id' => 'required|string|unique:archives,archive_id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document_type' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'file_path' => 'nullable|string',
            'file_name' => 'nullable|string',
            'file_type' => 'nullable|string',
            'file_size' => 'nullable|integer',
            'document_date' => 'nullable|date',
            'archived_date' => 'nullable|date',
            'archived_by' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'status' => 'nullable|in:Active,Archived,Deleted',
            'tags' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $archive = Archive::create($data);
            return response()->json(['archive' => $archive, 'message' => 'Archive created successfully'], 201);
        } catch (\Throwable $e) {
            \Log::error('Archive store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error creating archive',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified archive
     */
    public function show($id)
    {
        $archive = Archive::findOrFail($id);
        return response()->json($archive);
    }

    /**
     * Update the specified archive
     */
    public function update(Request $request, $id)
    {
        $archive = Archive::findOrFail($id);

        $data = $request->validate([
            'archive_id' => 'sometimes|required|string|unique:archives,archive_id,' . $id,
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'document_type' => 'sometimes|nullable|string|max:255',
            'category' => 'sometimes|nullable|string|max:255',
            'file_path' => 'sometimes|nullable|string',
            'file_name' => 'sometimes|nullable|string',
            'file_type' => 'sometimes|nullable|string',
            'file_size' => 'sometimes|nullable|integer',
            'document_date' => 'sometimes|nullable|date',
            'archived_date' => 'sometimes|nullable|date',
            'archived_by' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'reference_number' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|nullable|in:Active,Archived,Deleted',
            'tags' => 'sometimes|nullable|string',
            'notes' => 'sometimes|nullable|string',
        ]);

        $archive->update($data);
        return response()->json(['archive' => $archive, 'message' => 'Archive updated successfully']);
    }

    /**
     * Remove the specified archive
     */
    public function destroy($id)
    {
        $archive = Archive::findOrFail($id);
        
        // Optionally delete the file if it exists
        if ($archive->file_path && Storage::exists($archive->file_path)) {
            Storage::delete($archive->file_path);
        }
        
        $archive->delete();
        return response()->json(['message' => 'Archive deleted successfully'], 200);
    }

    /**
     * Upload file for archive
     */
    public function uploadFile(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $archive = Archive::findOrFail($id);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('archives', $fileName, 'public');

            $archive->update([
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return response()->json([
                'archive' => $archive,
                'message' => 'File uploaded successfully'
            ]);
        }

        return response()->json(['message' => 'No file provided'], 400);
    }
}
