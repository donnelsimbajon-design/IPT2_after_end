<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncDepartmentCodes extends Command
{
    protected $signature = 'departments:sync-codes';
    protected $description = 'Sync old department codes to new codes in students and faculties tables';

    public function handle()
    {
        $this->info('Syncing department codes...');

        // You need to manually map old codes to new codes here
        $codeMapping = [
            // 'old_code' => 'new_code',
            // Based on your data, map these old numeric codes:
            '102' => 'CSP',  // Change 'CSP' to the correct department code
            '103' => 'AP',   // Change 'AP' to the correct department code  
            '104' => 'BAP',  // Change 'BAP' to the correct department code
            '105' => 'NP',   // Change 'NP' to the correct department code (if exists)
            // Add more mappings as needed
        ];

        if (empty($codeMapping)) {
            $this->error('Please configure the code mapping in the command file first!');
            $this->info('Edit: app/Console/Commands/SyncDepartmentCodes.php');
            return 1;
        }

        $studentsUpdated = 0;
        $facultiesUpdated = 0;

        foreach ($codeMapping as $oldCode => $newCode) {
            // Update students using raw SQL
            $count = DB::update(
                "UPDATE students SET department = ? WHERE department = ?",
                [$newCode, $oldCode]
            );
            $studentsUpdated += $count;

            // Update faculties using raw SQL
            $count = DB::update(
                "UPDATE faculties SET department = ? WHERE department = ?",
                [$newCode, $oldCode]
            );
            $facultiesUpdated += $count;

            $this->info("Updated {$oldCode} -> {$newCode}");
        }

        $this->info("Successfully updated {$studentsUpdated} students and {$facultiesUpdated} faculties");
        return 0;
    }
}
