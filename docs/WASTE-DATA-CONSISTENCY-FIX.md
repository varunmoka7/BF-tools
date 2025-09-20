# Waste Data Consistency Fix

## Problem Description

The company profile page was showing mismatched data between **Waste Management Metrics** and **Detailed Waste Streams** sections. This occurred because:

1. **Waste Management Metrics** comes from the `company_metrics` table (aggregated totals)
2. **Detailed Waste Streams** comes from the `waste_streams` table (individual waste types)
3. The two data sources were not properly synchronized
4. The waste streams API was only showing generated waste amounts, not recovered/disposed amounts

## Root Cause Analysis

### Data Structure Issues

1. **`waste_streams` table structure:**
   - Only has a `value` field (representing generated waste)
   - Missing separate `recovered` and `disposed` fields
   - No direct relationship to aggregated metrics

2. **`company_metrics` table structure:**
   - Contains aggregated totals (generated, recovered, disposed)
   - Stored separately from waste streams
   - May not be updated when waste streams change

3. **API Implementation Issues:**
   - Waste streams API was not calculating recovered/disposed amounts
   - No cross-referencing between the two data sources
   - No consistency validation

## Solution Implemented

### 1. Enhanced Waste Streams API

**File:** `apps/waste-intelligence-platform/src/app/api/companies/[id]/waste-streams/route.ts`

**Changes:**
- Added cross-referencing with `company_metrics` table
- Calculate proportional recovered and disposed amounts for each waste stream
- Added summary calculations for verification
- Include original metrics data for comparison

**Key Features:**
```javascript
// Calculate proportional amounts based on stream's contribution to total
const proportion = stream.value / totalGenerated;
recovered = totalRecovered * proportion;
disposed = totalDisposed * proportion;
```

### 2. Enhanced UI with Data Consistency Warnings

**File:** `apps/waste-intelligence-platform/src/components/companies/WasteMetricsDashboard.tsx`

**Changes:**
- Added data consistency checking function
- Display warnings when metrics and streams don't match
- Added summary statistics for waste streams
- Enhanced table to show recovered and disposed amounts
- Color-coded alerts for data quality

**Key Features:**
```javascript
const checkDataConsistency = (year: string) => {
  const metricsTotal = yearMetrics.total_waste_generated || 0;
  const streamsTotal = yearSummary.totalGenerated || 0;
  const percentDifference = (difference / metricsTotal) * 100;
  
  if (percentDifference > 5) {
    return { consistent: false, message: `Data mismatch: ${percentDifference.toFixed(1)}% difference` };
  }
  
  return { consistent: true, message: 'Data is consistent' };
};
```

### 3. Data Synchronization Script

**File:** `scripts/sync-waste-data.js`

**Purpose:**
- Recalculate aggregated metrics from waste streams
- Update `company_metrics` table to ensure consistency
- Identify and report discrepancies
- Provide detailed logging and error handling

**Key Features:**
- Processes all companies systematically
- Calculates metrics from waste streams
- Compares with existing metrics
- Updates database with corrected values
- Generates comprehensive reports

## Usage Instructions

### Running the Synchronization Script

1. **Set up environment variables:**
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   export SUPABASE_SERVICE_ROLE_KEY="your_service_key"
   ```

2. **Run the script:**
   ```bash
   node scripts/sync-waste-data.js
   ```

3. **Review the output:**
   - Check for any discrepancies found
   - Verify the number of records updated
   - Address any errors reported

### Manual Data Verification

1. **Check company profile pages** for consistency warnings
2. **Compare metrics totals** with waste stream summaries
3. **Verify recovery rates** match between sections
4. **Look for data quality indicators** in the UI

## Data Quality Improvements

### Before Fix
- ❌ Waste streams only showed generated amounts
- ❌ No consistency validation
- ❌ Mismatched totals between sections
- ❌ No data quality indicators

### After Fix
- ✅ Waste streams show generated, recovered, and disposed amounts
- ✅ Real-time consistency validation
- ✅ Matching totals between sections
- ✅ Clear data quality indicators and warnings
- ✅ Automated synchronization capabilities

## Monitoring and Maintenance

### Regular Checks
1. **Run synchronization script** monthly or after data updates
2. **Monitor consistency warnings** in the UI
3. **Review discrepancy reports** from the script
4. **Validate data quality** indicators

### Best Practices
1. **Always update both tables** when adding new waste data
2. **Use the synchronization script** after bulk data imports
3. **Monitor for consistency warnings** in production
4. **Document any data discrepancies** found

## Technical Implementation Details

### API Response Structure

**Waste Streams API now returns:**
```json
{
  "success": true,
  "data": [...],
  "groupedByYear": {...},
  "years": [...],
  "latestYear": "2024",
  "yearSummaries": {
    "2024": {
      "totalGenerated": 150000,
      "totalRecovered": 105000,
      "totalDisposed": 45000,
      "recoveryRate": 70.0
    }
  },
  "metricsData": [...]
}
```

### UI Components

**Enhanced features:**
- Data consistency alerts
- Summary statistics panels
- Enhanced waste streams table
- Color-coded data quality indicators
- Real-time validation feedback

## Future Improvements

### Planned Enhancements
1. **Real-time synchronization** triggers
2. **Advanced data validation** rules
3. **Automated discrepancy resolution**
4. **Enhanced reporting** capabilities
5. **Data quality scoring** system

### Database Schema Improvements
1. **Add recovered/disposed fields** to waste_streams table
2. **Implement foreign key constraints** for better data integrity
3. **Add data validation triggers**
4. **Create materialized views** for performance

## Troubleshooting

### Common Issues

1. **Script fails to connect to database:**
   - Verify environment variables
   - Check Supabase credentials
   - Ensure network connectivity

2. **Data still shows inconsistencies:**
   - Run synchronization script
   - Check for new data that needs processing
   - Verify API endpoints are updated

3. **UI shows warnings:**
   - This is expected behavior for data quality
   - Review the specific discrepancies
   - Consider running synchronization script

### Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Review the synchronization script output
3. Verify database connectivity and permissions
4. Contact the development team with specific error details
