import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Png: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Work with AIs',
    Png: require('@site/static/img/ais-work.png').default,
    description: (
      <>
        Description for "Work with AIs"
      </>
    ),
  },
  {
    title: 'Play with AIs',
    Png: require('@site/static/img/ais-play.png').default,
    description: (
      <>
        Description for "Play with AIs"
      </>
    ),
  },
  {
    title: 'Earn with AIs',
    Png: require('@site/static/img/ais-earn.png').default,
    description: (
      <>
        Description for "Earn with AIs"
      </>
    ),
  },
];

function Feature({title, Png, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Png} className={styles.featureImg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
