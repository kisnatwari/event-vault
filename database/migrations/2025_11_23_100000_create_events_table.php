<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->string('device_id_from_event')->index();

            // Event Identification
            $table->string('employee_no_string')->index();
            $table->string('name')->index();
            $table->string('event_datetime')->index(); // Store original ISO 8601 string from device
            $table->timestamp('received_at');

            // Event Types & Status
            $table->string('event_type')->nullable();
            $table->string('event_state')->nullable();
            $table->integer('major_event_type')->nullable();
            $table->integer('sub_event_type')->nullable();
            $table->string('event_description')->nullable();

            // Device Information
            $table->string('ip_address', 45)->nullable();
            $table->string('mac_address', 17)->nullable();
            $table->integer('channel_id')->nullable();
            $table->string('device_name')->nullable();
            $table->integer('port_no')->nullable();
            $table->string('protocol')->nullable();

            // Access Control Details
            $table->integer('verify_no')->nullable();
            $table->integer('serial_no')->nullable();
            $table->integer('front_serial_no')->nullable();
            $table->string('user_type')->nullable();
            $table->string('current_verify_mode')->nullable();
            $table->integer('card_reader_kind')->nullable();
            $table->integer('card_reader_no')->nullable();
            $table->integer('door_no')->nullable();
            $table->string('attendance_status')->nullable();
            $table->integer('status_value')->nullable();
            $table->string('mask')->nullable();
            $table->boolean('pure_pwd_verify_enable')->nullable();

            // Complex/Nested Data (JSON)
            $table->json('face_rect')->nullable();
            $table->json('raw_event_data')->nullable();

            $table->timestamps();

            // Composite indexes for common query patterns
            $table->index(['device_id', 'event_datetime']);
            $table->index(['employee_no_string', 'event_datetime']);
            $table->index(['major_event_type', 'sub_event_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

