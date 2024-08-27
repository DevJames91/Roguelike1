import chalk from 'chalk';
import readlineSync from 'readline-sync';
//실행 컨텍스트 -> 전역을 먼저 생성 후 -> 내부 생성
// 전역에 쓰는 경우 : 모두가 쓰는 static 함수, 전역에다가 변수를 생성한다 X
// const player = new Player();
// => constructor()
class Player {
  constructor() {
    this.hp = 100;
    this.damage = 10;
    this.minDamage = this.damage;
    this.maxDamage = this.damage;
    this.initialDamage = 0;
    this.firstDamage = 0;
    this.secondDamage = 0;
    this.level = 1;
    // 확률 25% and 50% 50%
    this.runAwayPercent = 25;
    this.doublePercent = 50;
    this.defensePercent = 50;
    // 처음으로 플레이어를 초기화 했을때 Max 데미지를 랜덤값으로 만들어주는 함수 실행
    this.makeMaxDamage();
  }
  attack(target) {
    // 플레이어의 공격
    // minDamage = 10 , maxDamage = 17
    this.initialDamage = randomNumber(this.minDamage, this.maxDamage);
    target.hp = target.hp - this.initialDamage;
  }
  doubleAttack(target) {
    // this.firstDamage와 this.secondDamage가 생성됩니다.
    this.makeDoubleDamage();
    // 공격을 했으니 데미지 계산이 들어가야합니다.
    target.hp = target.hp - (this.firstDamage + this.secondDamage);
  }
  makeDoubleDamage() {
    this.firstDamage = randomNumber(this.minDamage, this.maxDamage);
    this.secondDamage = randomNumber(this.minDamage, this.maxDamage);
  }
  // 플레이어의 공격
  // minDamage = 10 , maxDamage = 17
  makeMaxDamage() {
    // level : 1 => maxDamage 15~20
    this.maxDamage = randomNumber(this.damage, this.damage + 5 + 5 * this.level);
  }
}
class Monster {
  // 클래스 플레이어로 넣은 정보값을 토대로 몬스터도 작성.
  constructor() {
    this.hp = 100;
    this.damage = 5;
    this.minDamage = this.damage;
    this.maxDamage = this.damage;
    this.initialDamage = 0;
    this.level = 1;
    this.makemonsterDamage();
  }
  attack(target) {
    // 몬스터의 공격
    this.initialDamage = randomNumber(this.minDamage, this.maxDamage);
    target.hp = target.hp - this.initialDamage;
    return this.initialDamage;
  }
  makemonsterDamage() {
    // level : 1 => maxDamage 10
    this.maxDamage = randomNumber(this.damage, this.damage + 5 + (1 + this.level));
  }
}
// 데미지를 랜덤값으로 계산하기 위해서 randomNumber 함수를 만들었다.
// player든 monster class 안에서 randomNumber(minDamage, maxDamage) => 나오는 값 랜덤한 공격 값이 나오죠.
function randomNumber(min, max) {
  // min <= result <= max
  // Math.random() => 0~1사이의 무한대범위 값이 랜덤하게 나온다
  // min = 10 max = 100 Math.random() = 0.1 Math.random()*(max-min) + min=> 19
  let result = Math.floor(Math.random() * (max - min) + min);
  // return 값이 정수다
  return result;
}
// value = this.runAwayPercent = 25;
function randomBoolean(value) {
  // 1<= result <= 100
  let result = Math.floor(Math.random() * (100 - 1) + 1);
  return result <= value ? true : false;
}
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| 플레이어 정보 : 체력 ${player.hp} 공격력 ${player.minDamage}~${player.maxDamage}`,
      ) +
      chalk.redBright(`| 몬스터 정보 :  체력 : ${monster.hp}  공격력 : 5~11|`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}
const battle = async (stage, player, monster) => {
  let logs = [];
  let playerCanRunAway = false;
  while (player.hp > 0) {
    if (monster.hp <= 0) {
      break;
    }
    console.clear();
    displayStatus(stage, player, monster);
    // 몬스터가 <= 0 일때 조건문 코드 넣기
    logs.forEach((log) => console.log(log));
    console.log(
      chalk.green(
        `\n1. 공격한다 2. 도망가다${player.runAwayPercent}%. 3. 더블어택${player.doublePercent}%.  4.방어하기${player.defensePercent}%`,
      ),
    );
    // while문이 여기서 잠깐 멈춤 우리가 키를 입력하기 전까지
    const choice = readlineSync.question('당신의 선택은? ');
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
    // 플레이어의 선택에 따라 다음 행동 처리
    switch (choice) {
      case '1':
        player.attack(monster);
        logs.push(chalk.green(`몬스터가 공격을 ${player.initialDamage}만큼 받았습니다.`));
        monster.attack(player);
        logs.push(chalk.red(`피해를 ${monster.initialDamage}만큼 입었습니다.`));
        break;
      case '2':
        // 도망가는게 누군가에게 타격을 준다? X
        // 도망가는것은 실패할 수도 있고 성공할 수도 있다.
        // 성공하면? battle문에서 도망가야함 while문에서 벗어나야 한다. 어떻게?
        playerCanRunAway = randomBoolean(player.runAwayPercent);
        if (playerCanRunAway === false) {
          logs.push(chalk.green(`플레이어가 도망에 실패했습니다.`));
          const damage = monster.attack(player);
          logs.push(chalk.red(`피해를 ${damage}만큼 입었습니다.`));
        }
        break;
      case '3':
        {
          // 더블어택 공격을 성공했거나 안했거나
          if (randomBoolean(player.doublePercent)) {
            // 여기에 들어오면 더블어택 성공
            logs.push(chalk.green(`더블 어택 성공!`));
            player.doubleAttack(monster);
            logs.push(
              chalk.green(`플레이어가 몬스터에게 ${player.firstDamage}만큼 데미지를 줬습니다.`),
            );
            logs.push(
              chalk.green(`플레이어가 몬스터에게 ${player.secondDamage}만큼 데미지를 줬습니다.`),
            );
          } else {
            // 여기에 들어오면 더블어택 실패
          }
          // 몬스터가 살아있다 면 플레이어도 공격을 받아야죠
          if (monster.hp > 0) {
            monster.attack(player);
            logs.push(chalk.red(`피해를 ${monster.initialDamage}만큼 입었습니다.`));
          }
        }
        break;
      case '4':
        let playercanDefense = randomBoolean(player.defensePercent);
        if (playercanDefense === false) {
          logs.push(chalk.green(`방어 실패!`));
          const damage = monster.attack(player);
          logs.push(chalk.red(`피해를 ${damage}만큼 입었습니다.`));
        } else {
          logs.push(chalk.green(`방어 성공!`));
        }
        break;
      default:
        break;
    }
    if (playerCanRunAway) {
      break;
    }
  }
};
export async function startGame() {
  console.clear();
  const player = new Player();
  // player.maxDamage(); 에 넣어도 된다
  // new는 바로 뒤에 오는 함수를 무조건 실행하겠다.
  let stage = 1;
  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);
    // 스테이지 클리어 및 게임 종료 조건
    stage++;
  }
}
// 플레이어의 선택에 따라 다음 행동 처리
// 플레이어가 몬스터한테 공격 받을 때는 언제인가?
// 1. 플레이어가 몬스터를 공격하면 몬스터도 공격한다.
// 2. 플레이어가 더블어택을 쓸때 -> 공격을 확률적으로 2번한다. 예를 들어 3번 옵션 구현에 더블어택(50퍼센트 확률로 적을 두번때리거나 맞기만한다)
// 3. 플레이어가 도망에 실패 할때
// 4. 방어에 실패할 때
