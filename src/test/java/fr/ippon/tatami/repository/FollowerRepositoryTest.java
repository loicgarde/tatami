package fr.ippon.tatami.repository;

import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import java.util.Collection;

import me.prettyprint.cassandra.model.CqlQuery;
import me.prettyprint.cassandra.serializers.StringSerializer;

import org.testng.annotations.Test;

import fr.ippon.tatami.AbstractCassandraTatamiTest;
import fr.ippon.tatami.domain.User;
import fr.ippon.tatami.domain.UserFollowers;

public class FollowerRepositoryTest extends AbstractCassandraTatamiTest
{

	@Test
	public void testAddFollower()
	{
		User user = new User();
		user.setLogin("test");
		user.setEmail("test@ippon.fr");
		user.setFirstName("firstname");
		user.setLastName("lastname");

		this.userRepository.createUser(user);

		this.followerRepository.addFollower("test", "jdubois");
		this.followerRepository.addFollower("test", "tescolan");

		User refreshedUser = this.userRepository.findUserByLogin("test");
		Collection<String> userFollowers = this.entityManager.find(UserFollowers.class, "test").getFollowers();

		assertTrue(userFollowers.size() == 2, "userFollowers.size() == 2");
		assertTrue(refreshedUser.getFollowersCount() == 2, "refreshedUser.getFollowersCount() == 2");
		assertTrue(userFollowers.contains("jdubois"), "refreshedUser has jdubois as follower");
		assertTrue(userFollowers.contains("tescolan"), "refreshedUser has tescolan as follower");
	}

	@Test(dependsOnMethods = "testAddFollower")
	public void testFindFollowersForUser()
	{
		Collection<String> userFollowers = this.followerRepository.findFollowersForUser("test");

		assertTrue(userFollowers.size() == 2, "friends.size()");
		assertTrue(userFollowers.contains("jdubois"), "userFollowers has 'jdubois'");
		assertTrue(userFollowers.contains("tescolan"), "userFollowers has 'tescolan'");
	}

	@Test(dependsOnMethods = "testFindFollowersForUser")
	public void testRemoveFollower()
	{
		this.followerRepository.removeFollower("test", "jdubois");
		this.followerRepository.removeFollower("test", "tescolan");

		User refreshedUser = this.userRepository.findUserByLogin("test");
		Collection<String> userFollowers = this.followerRepository.findFollowersForUser("test");

		assertTrue(userFollowers.size() == 0, "userFollowers.size()==0");
		assertTrue(refreshedUser.getFollowersCount() == 0, "refreshedUser.getFollowersCount()==0");

		CqlQuery<String, String, String> cqlQuery = new CqlQuery<String, String, String>(keyspace, StringSerializer.get(), StringSerializer.get(),
				StringSerializer.get());
		cqlQuery.setQuery("delete from User where KEY='test'");
		cqlQuery.execute();

		User deletedUser = this.userRepository.findUserByLogin("test");
		assertNull(deletedUser, "deletedUser");
	}
}
