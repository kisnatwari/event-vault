<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWebhookJob implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 1;

    /**
     * Indicate if the job should be marked as failed on timeout.
     */
    public $failOnTimeout = false;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $webhookUrl,
        public array $eventData
    ) {
        // Set timeout to 0 to disable timeout (fire-and-forget)
        $this->timeout = 0;
    }

    /**
     * Execute the job.
     * Fire-and-forget: Send webhook without waiting for response or timeout.
     */
    public function handle(): void
    {
        try {
            // Use HTTP client with minimal timeout - fire and forget
            // We don't wait for response, don't verify SSL, and don't care about errors
            Http::timeout(1)
                ->withoutVerifying() // Don't verify SSL for faster connection
                ->post($this->webhookUrl, $this->eventData);
            
            // Note: We don't check the response or wait for it
            // This is truly fire-and-forget - we just send and move on
        } catch (\Exception $e) {
            // Silently fail - this is fire-and-forget
            // We don't want to log errors, retry, or throw exceptions for webhooks
            // The client's webhook endpoint might be down, slow, or unreachable
            // and we don't want that to affect event processing
            // No logging, no retries, just silently continue
        }
    }
}
