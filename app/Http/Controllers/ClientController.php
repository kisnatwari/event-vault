<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\Client;
use App\Models\Device;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::with(['devices', 'apiTokens' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])
            ->orderBy('name')
            ->get();

        return Inertia::render('clients/index', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'devices' => ['sometimes', 'array'],
            'devices.*.name' => ['nullable', 'string', 'max:255'],
            'devices.*.mac_address' => ['required_with:devices.*.name', 'string', 'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/'],
        ]);

        $client = Client::create([
            'name' => $validated['name'],
            'webhook_url' => $validated['webhook_url'] ?? null,
        ]);

        $devicePayload = collect($validated['devices'] ?? [])
            ->filter(fn ($device) => !empty($device['name']) && !empty($device['mac_address']))
            ->map(fn ($device) => [
                'name' => trim($device['name']),
                'mac_address' => trim($device['mac_address']),
            ])
            ->values()
            ->all();

        if ($devicePayload) {
            $client->devices()->createMany($devicePayload);
        }

        return redirect()->route('clients.index');
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
        ]);

        $client->update($validated);

        return back();
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return back();
    }

    public function addDevice(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mac_address' => ['required', 'string', 'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/'],
        ]);

        $client->devices()->create([
            'name' => $validated['name'],
            'mac_address' => $validated['mac_address'],
        ]);

        return back();
    }

    public function updateDevice(Request $request, Device $device): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mac_address' => ['required', 'string', 'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/'],
        ]);

        $device->update($validated);

        return back();
    }

    public function deleteDevice(Request $request, Device $device): RedirectResponse
    {
        $device->delete();

        return back()->with('success', 'Device deleted successfully.');
    }

    /**
     * Generate a new API token for a client.
     */
    public function generateApiToken(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $plainToken = ApiToken::generateToken();
        $hashedToken = hash('sha256', $plainToken);

        $apiToken = new ApiToken([
            'name' => $validated['name'],
            'token' => $hashedToken,
            'expires_at' => $validated['expires_at'] ? \Carbon\Carbon::parse($validated['expires_at']) : null,
            'is_active' => true,
        ]);
        $client->apiTokens()->save($apiToken);

        // Store plain token in session to show it once
        session()->flash('api_token_generated', [
            'token' => $plainToken,
            'name' => $apiToken->name,
            'expires_at' => $apiToken->expires_at?->toDateTimeString(),
        ]);

        return back()->with('success', 'API token generated successfully. Please copy it now as it will not be shown again.');
    }

    /**
     * Revoke an API token.
     */
    public function revokeApiToken(Request $request, ApiToken $apiToken): RedirectResponse
    {
        $apiToken->update(['is_active' => false]);

        return back()->with('success', 'API token revoked successfully.');
    }

    /**
     * Delete an API token permanently.
     */
    public function deleteApiToken(Request $request, ApiToken $apiToken): RedirectResponse
    {
        $apiToken->delete();

        return back()->with('success', 'API token deleted successfully.');
    }
}

