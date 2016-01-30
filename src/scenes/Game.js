import React, {Component} from 'react';
import { background } from 'images';
import { decisionNodes } from 'data';
import Scene from './Scene';
import { BackgroundImage, Button, ProgressBar, Text } from 'components';
import consts from 'consts';

import World from 'store/World';

var belief = consts.belief.init;

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectionVisible: true,
      timer: consts.timer,
      resultText: '',
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  startTimer = () => {
    this.timerId = setInterval(() => {
      this.setState({
        timer: this.state.timer - 1,
      }, () => {
        this.processTimer();
      });
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timerId);
  };

  resetTimer = () => {
    this.setState({
      timer: consts.timer,
    });
  };

  processTimer = () => {
    if (this.state.timer <= 0) {
      this.selDecision(5);
      this.resetTimer();
    }
  };

  getAvailableDecisions = () => {
    var availableDecisions = decisionNodes.filter(elem => elem.min < belief && belief < elem.max);
    return availableDecisions[Math.floor(Math.random() * availableDecisions.length)];
  };

  switchToGame = () => {
    if (this.nextScene === 'Game') {
      this.setState({
        selectionVisible: true,
        resultText: '',
      });
    } else {
      World.trigger('scene', this.nextScene);
    }
  };

  selDecision = (effect) => {
    belief += effect;
    let text = '';
    if (belief >= consts.belief.max) {
      text = this.selectedDecision.effects.win;
      this.nextScene = 'Intro';
    } else if (belief <= consts.belief.min) {
      text = this.selectedDecision.effects.fail;
      this.nextScene = 'Intro';
    } else if (effect > 0) {
      text = this.selectedDecision.effects.pos;
      this.nextScene = 'Game';
    } else if (effect < 0) {
      text = this.selectedDecision.effects.neg;
      this.nextScene = 'Game';
    }
    this.setState({
      selectionVisible: false,
      resultText: text,
    });
  };

  render() {
    this.selectedDecision = this.getAvailableDecisions();
    // TODO mark selected decisions to not be used again
    const decisions = this.selectedDecision.selection.map((dec, i) => {
      return <Button key={i} className={`button-$(i)`} onClick={() => this.selDecision(dec.effect)}>{i + 1}. {dec.text}</Button>;
    });

    const textContainer = (() => {
      if (this.state.selectionVisible) {
        return (
          <div>
            <Button className="text-area">{decisionNodes[0].intro}</Button>
            {decisions}
            <ProgressBar className="time" progress={(this.state.timer / consts.timer) * 100} />
          </div>
        );
      } else {
        return (
          <div>
            <Text className="text-area">{this.state.resultText}</Text>
            <Button onClick={this.switchToGame}>Continue</Button>
          </div>
        );
      }
    })();

    return (
      <Scene name="game">
        <BackgroundImage src={background} />
        <ProgressBar className="belief" progress={belief} caption="How much do I feel people trust me?" />
        <div className="text-container">{textContainer}</div>
      </Scene>
    );
  }
}

export default Game;
