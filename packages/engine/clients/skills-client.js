import {
  defaultSkillSpecs,
} from '../ai-agent/skills/skills.js';
import {
  templateString,
} from '../utils/companion-utils.js';

//

class Skill extends EventTarget {
  constructor(spec) {
    super();

    const {
      name = '',
      description = '',
      value = '',
      format = '',
      progressive = null,
      handlerUrl = '',
      makeHandleFn = null, // XXX will soon be deprecated
    } = (spec ?? {});
    
    this.spec = {
      name,
      description,
      value,
      format,
      progressive,
      handlerUrl,
      makeHandleFn,
    };
  }

  format(o) {
    const {
      format,
    } = this.spec;
    return templateString(format, o);
  }

  setSkillAttribute(key, value) {
    this.spec[key] = value;

    // XXX should write to the db here

    this.dispatchEvent(new MessageEvent('skillupdate', {
      data: {
        key,
        value,
      },
    }));
  }
}

//

export class SkillsClient extends EventTarget {
  constructor() {
    super();

    this.skills = new Map();

    for (const spec of defaultSkillSpecs) {
      const skill = new Skill(spec);
      this.skills.set(spec.name, skill);
    }
  }

  getSkills() {
    return this.skills;
  }

  addNewSkill() {
    // find the first name that's free for UNTITLED_SKILL_
    let i = 0;
    let name = `UNTITLED_SKILL_${i}`;
    while (this.skills.has(name)) {
      i++;
      name = `UNTITLED_SKILL_${i}`;
    }

    const skill = new Skill({
      name,
    });
    this.skills.set(name, skill);

    this.dispatchEvent(new MessageEvent('skillsupdate'));
  }
  removeSkill(skill) {
    this.skills.delete(skill.name);

    this.dispatchEvent(new MessageEvent('skillsupdate'));
  }

  getSkillHandler(skillName, ctx) {
    const skill = this.skills.get(skillName);
    if (skill) {
      const skillSpec = skill.spec;
      return {
        ...skillSpec,
        handleFn: skillSpec.makeHandleFn(ctx),
      };
    } else {
      return null;
    }
  }
}