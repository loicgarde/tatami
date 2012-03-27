package fr.ippon.tatami.domain;

import java.util.Calendar;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.EqualsAndHashCode;
import lombok.ToString;

import org.joda.time.Duration;
import org.joda.time.Period;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;

/**
 * A user.
 * 
 * @author Julien Dubois
 */
@Entity
@Table(name = "Tweet")
@EqualsAndHashCode(of = "tweetId")
@ToString
public class Tweet
{

	private static PeriodFormatter dayFormatter = new PeriodFormatterBuilder().appendDays().appendSuffix("d").toFormatter();

	private static PeriodFormatter hourFormatter = new PeriodFormatterBuilder().appendHours().appendSuffix("h").toFormatter();

	private static PeriodFormatter minuteFormatter = new PeriodFormatterBuilder().appendMinutes().appendSuffix("m").toFormatter();

	private static PeriodFormatter secondFormatter = new PeriodFormatterBuilder().appendSeconds().appendSuffix("s").toFormatter();

	@Id
	private String tweetId;

	@Column(name = "login")
	private String login;

	@Column(name = "content")
	private String content;

	@Column(name = "tweetDate")
	private Date tweetDate;

	private String firstName;

	private String lastName;

	private String gravatar;

	@Column(name = "removed")
	private Boolean removed;

	public String getPrettyPrintTweetDate()
	{
		Duration duration = new Duration(Calendar.getInstance().getTimeInMillis() - tweetDate.getTime());

		Period period = duration.toPeriod();

		if (period.getDays() > 0)
		{
			return dayFormatter.print(duration.toPeriod());
		}
		else if (period.getHours() > 0)
		{
			return hourFormatter.print(duration.toPeriod());
		}
		else if (period.getMinutes() > 0)
		{
			return minuteFormatter.print(duration.toPeriod());
		}
		else
		{
			return secondFormatter.print(duration.toPeriod());
		}
	}

	public String getTweetId()
	{
		return tweetId;
	}

	public void setTweetId(String tweetId)
	{
		this.tweetId = tweetId;
	}

	public String getLogin()
	{
		return login;
	}

	public void setLogin(String login)
	{
		this.login = login;
	}

	public String getContent()
	{
		return content;
	}

	public void setContent(String content)
	{
		this.content = content;
	}

	public Date getTweetDate()
	{
		return tweetDate;
	}

	public void setTweetDate(Date tweetDate)
	{
		this.tweetDate = tweetDate;
	}

	public String getFirstName()
	{
		return firstName;
	}

	public void setFirstName(String firstName)
	{
		this.firstName = firstName;
	}

	public String getLastName()
	{
		return lastName;
	}

	public void setLastName(String lastName)
	{
		this.lastName = lastName;
	}

	public String getGravatar()
	{
		return gravatar;
	}

	public void setGravatar(String gravatar)
	{
		this.gravatar = gravatar;
	}

	public Boolean getRemoved()
	{
		return removed;
	}

	public void setRemoved(Boolean removed)
	{
		this.removed = removed;
	}

}
