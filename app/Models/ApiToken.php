<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'name',
        'token',
        'last_used_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'token',
    ];

    /**
     * Get the client that owns this API token.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Generate a new API token.
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Check if token is valid (active and not expired).
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Find token by plain text token.
     */
    public static function findByToken(string $plainToken): ?self
    {
        $hashedToken = hash('sha256', $plainToken);

        return static::where('token', $hashedToken)->first();
    }

    /**
     * Update last used timestamp.
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}

