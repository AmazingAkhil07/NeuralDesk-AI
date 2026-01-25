// Quick test to see what news is being aggregated
import { aggregateAllNews } from './lib/services/newsAggregator.js'

async function testNewsAggregation() {
    console.log('🧪 Testing News Aggregation...\n')

    try {
        const news = await aggregateAllNews()

        console.log(`\n✅ Total news items: ${news.length}`)

        if (news.length > 0) {
            console.log('\n📰 Sample news (first 5):')
            news.slice(0, 5).forEach((item, i) => {
                console.log(`\n${i + 1}. ${item.title}`)
                console.log(`   Source: ${item.source}`)
                console.log(`   Published: ${item.publishedAt}`)
                console.log(`   URL: ${item.url.substring(0, 60)}...`)
            })
        } else {
            console.error('\n❌ No news items found!')
        }
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

testNewsAggregation()
