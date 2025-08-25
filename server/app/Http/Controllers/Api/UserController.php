<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get the authenticated user's profile
     */
    public function profile()
    {
        $user = Auth::user();
        
        // Get user statistics
        $stats = [
            'total_vehicles' => $user->vehicles()->count(),
            'active_vehicles' => $user->vehicles()->where('status', 'active')->count(),
            'sold_vehicles' => $user->vehicles()->where('status', 'sold')->count(),
            'total_views' => $user->vehicles()->sum('views_count'),
            'total_favorites' => $user->vehicles()->sum('favorites_count'),
        ];

        return response()->json([
            'message' => 'Profile retrieved successfully',
            'data' => [
                'user' => $user,
                'stats' => $stats,
            ]
        ]);
    }

    /**
     * Update the authenticated user's profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9\-\(\)\s]+$/',
            'bio' => 'nullable|string|max:1000',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'current_password' => 'nullable|string|min:8',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        // Handle password change
        if ($request->filled('current_password') && $request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                    'errors' => [
                        'current_password' => ['Current password is incorrect']
                    ]
                ], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        // Update other fields
        $user->fill($request->only([
            'name', 'email', 'phone', 'bio', 'city', 'state'
        ]));

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Delete user avatar
     */
    public function deleteAvatar()
    {
        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Avatar deleted successfully',
            'data' => $user
        ]);
    }

    /**
     * Get user's activity summary
     */
    public function activitySummary()
    {
        $user = Auth::user();

        $recentVehicles = $user->vehicles()
            ->with(['category', 'make', 'model', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $monthlyStats = $user->vehicles()
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'message' => 'Activity summary retrieved successfully',
            'data' => [
                'recent_vehicles' => $recentVehicles,
                'monthly_stats' => $monthlyStats,
            ]
        ]);
    }
}
