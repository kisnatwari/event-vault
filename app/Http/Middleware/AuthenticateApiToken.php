<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?? $request->header('X-API-Token') ?? $request->query('api_token');

        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'API token is required',
            ], 401);
        }

        $apiToken = ApiToken::findByToken($token);

        if (!$apiToken || !$apiToken->isValid()) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Invalid or expired API token',
            ], 401);
        }

        // Mark token as used
        $apiToken->markAsUsed();

        // Attach client to request for use in controllers
        $request->merge(['authenticated_client_id' => $apiToken->client_id]);
        $request->setUserResolver(function () use ($apiToken) {
            return $apiToken->client;
        });

        return $next($request);
    }
}

