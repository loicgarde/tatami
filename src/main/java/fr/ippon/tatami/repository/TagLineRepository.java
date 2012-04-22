package fr.ippon.tatami.repository;

import java.util.Collection;

public interface TagLineRepository
{
	void addTweet(String tag, String tweetId);

	Collection<String> findTweetsRangeForTag(String tag, int start, int end);
}