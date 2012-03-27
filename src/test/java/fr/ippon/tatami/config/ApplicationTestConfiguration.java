package fr.ippon.tatami.config;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.thrift.transport.TTransportException;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:/tatami/tatami-test.properties")
@ComponentScan(basePackages =
{
		"fr.ippon.tatami.repository",
		"fr.ippon.tatami.service"
})
@Import(value =
{
		CacheConfiguration.class,
		CassandraConfiguration.class
})
public class ApplicationTestConfiguration
{
	private final Log log = LogFactory.getLog(ApplicationTestConfiguration.class);

	@PostConstruct
	public void initTestTatami() throws IOException, TTransportException
	{
		log.info("Tatami test environment started!");
	}
}