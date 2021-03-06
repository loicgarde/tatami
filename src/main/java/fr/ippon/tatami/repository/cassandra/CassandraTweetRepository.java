package fr.ippon.tatami.repository.cassandra;

import static fr.ippon.tatami.config.ColumnFamilyKeys.TWEET_CF;

import java.util.Calendar;

import me.prettyprint.cassandra.model.CqlQuery;
import me.prettyprint.cassandra.utils.TimeUUIDUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import fr.ippon.tatami.domain.Tweet;
import fr.ippon.tatami.repository.TweetRepository;
import fr.ippon.tatami.service.util.TimeUUIdReorder;

/**
 * @author Julien Dubois
 * @author DuyHai DOAN
 */
public class CassandraTweetRepository extends CassandraAbstractRepository implements TweetRepository
{

	private final Logger log = LoggerFactory.getLogger(CassandraTweetRepository.class);

	@Override
	public Tweet createTweet(String login, String content, boolean notification)
	{
		Tweet tweet = new Tweet();
		tweet.setTweetId(TimeUUIdReorder.reorderTimeUUId(TimeUUIDUtils.getUniqueTimeUUIDinMillis().toString()));
		tweet.setOriginalTweetId(tweet.getTweetId());
		tweet.setSourceTweetId(tweet.getTweetId());
		tweet.setLogin(login);
		tweet.setOriginalAuthorLogin(login);
		tweet.setContent(content);
		tweet.setTweetDate(Calendar.getInstance().getTime());
		tweet.setNotification(notification);

		log.debug("Persisting Tweet : " + tweet);

		em.persist(tweet);
		return tweet;
	}

	@Override
	public void saveTweet(Tweet tweet)
	{
		em.persist(tweet);
	}

	@Override
	@Cacheable(value = "tweet-cache", key = "#tweetId")
	public Tweet findTweetById(String tweetId)
	{
		log.debug("Finding tweet : " + tweetId);

		return em.find(Tweet.class, tweetId);
	}

	@Override
	@CacheEvict(value = "tweet-cache", key = "#tweet.tweetId")
	public void removeTweet(Tweet tweet)
	{
		log.debug("Removing Tweet : " + tweet);
		CqlQuery<String, String, String> cqlQuery = new CqlQuery<String, String, String>(keyspaceOperator, se, se, se);

		cqlQuery.setQuery(" DELETE FROM " + TWEET_CF + " WHERE KEY = '" + tweet.getTweetId() + "';");
		cqlQuery.execute();

	}
}
