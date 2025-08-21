<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureVehicleOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the vehicle from the route
        $vehicle = $request->route('vehicle');

        // If there's a vehicle in the route, check ownership
        if ($vehicle && $vehicle->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized. You can only access your own vehicles.'
            ], 403);
        }

        return $next($request);
    }
}
