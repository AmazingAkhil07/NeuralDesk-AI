// Test script to check news functionality

async function testNews() {
  console.log('🧪 Testing News Aggregation...\n');
  
  try {
    // Test 1: Trigger cron job to fetch news
    console.log('1️⃣ Triggering news aggregation...');
    const cronResponse = await fetch('http://localhost:3000/api/cron/news', {
      headers: {
        'Authorization': 'Bearer neuraldesk_cron_secret_2026_secure_key_789xyz'
      }
    });
    
    const cronResult = await cronResponse.json();
    console.log('✅ Cron Response:', cronResult);
    console.log('');
    
    // Wait a moment for database
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Fetch news from API
    console.log('2️⃣ Fetching news from API...');
    const newsResponse = await fetch('http://localhost:3000/api/news');
    const newsResult = await newsResponse.json();
    
    if (newsResponse.status === 401) {
      console.log('⚠️  Not authenticated. Please log in first at http://localhost:3000/login');
    } else if (newsResponse.ok) {
      console.log(`✅ Found ${newsResult.data?.length || 0} news items`);
      if (newsResult.data?.length > 0) {
        console.log('\n📰 Sample news:');
        newsResult.data.slice(0, 3).forEach((item, i) => {
          console.log(`\n${i + 1}. ${item.title}`);
          console.log(`   Source: ${item.source}`);
          console.log(`   Tags: ${item.tags.join(', ')}`);
        });
      }
    } else {
      console.log('❌ Error:', newsResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNews();
