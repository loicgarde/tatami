package fr.ippon.tatami.repository.cassandra;

import static fr.ippon.tatami.config.ColumnFamilyKeys.USERLINE_CF;
import static me.prettyprint.hector.api.factory.HFactory.createSliceQuery;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import me.prettyprint.cassandra.model.CqlQuery;
import me.prettyprint.hector.api.beans.HColumn;
import fr.ippon.tatami.domain.User;
import fr.ippon.tatami.repository.UserLineRepository;

/**
 * @author Julien Dubois
 * @author DuyHai DOAN
 */
public class CassandraUserLineRepository extends CassandraAbstractRepository implements UserLineRepository
{
	@Override
	public void addTweetToUserline(User user, String tweetId)
	{

		CqlQuery<String, Long, String> cqlQuery = new CqlQuery<String, Long, String>(keyspaceOperator, se, le, se);
		cqlQuery.setQuery("INSERT INTO UserLine(KEY,'" + user.getTweetCount() + "') VALUES('" + user.getLogin() + "','" + tweetId + "')");
		cqlQuery.execute();

		user.incrementTweetCount();
		em.persist(user);
	}

	@Override
	public Collection<String> getTweetsRangeFromUserline(User user, int start, int end)
	{
		List<String> tweetIds = new ArrayList<String>();

		long maxTweetColumn = user.getTweetCount() - 1;
		long endTweetColumn = maxTweetColumn - start + 1;
		long startTweetColumn = maxTweetColumn - end + 1;
		int count = end - start + 1 == 0 ? 1 : end - start + 1;

		List<HColumn<Long, String>> columns = createSliceQuery(keyspaceOperator, se, le, se).setColumnFamily(USERLINE_CF).setKey(user.getLogin())
				.setRange(endTweetColumn, startTweetColumn, true, count).execute().get().getColumns();

		for (HColumn<Long, String> column : columns)
		{
			tweetIds.add(column.getValue());
		}
		return tweetIds;
	}
}