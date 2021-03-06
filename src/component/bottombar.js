import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import Icon from './icon';
import Dropdown from './dropdown';
import { xtoast } from './message';
import { tf } from '../locale/locale';

class DropdownMore extends Dropdown {
  constructor(click) {
    const icon = new Icon('ellipsis');
    super(icon, 'auto', false, 'top-left');
    this.contentClick = click;
  }

  reset(items) {
    const eles = items.map((it, i) => h('div', `${cssPrefix}-item`)
      .css('width', '150px')
      .css('font-weight', 'normal')
      .on('click', () => {
        this.contentClick(i);
        this.hide();
      })
      .child(it));
    this.setContentChildren(...eles);
  }

  setTitle() {}
}

const menuItems = [
  { key: 'delete', title: tf('contextmenu.deleteSheet') },
];

function buildMenuItem(item) {
  return h('div', `${cssPrefix}-item`)
    .child(item.title())
    .on('click', () => {
      this.itemClick(item.key);
      this.hide();
    });
}

function buildMenu() {
  return menuItems.map(it => buildMenuItem.call(this, it));
}

class ContextMenu {
  constructor() {
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .css('width', '160px')
      .children(...buildMenu.call(this))
      .hide();
    this.itemClick = () => {};
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setOffset(offset) {
    const { el } = this;
    el.offset(offset);
    el.show();
    bindClickoutside(el);
  }
}

export default class Bottombar {
  constructor(addFunc = () => {}, swapFunc = () => {}, deleteFunc = () => {}) {
    this.swapFunc = swapFunc;
    this.dataNames = [];
    this.activeEl = null;
    this.deleteEl = null;
    this.items = [];
    this.moreEl = new DropdownMore((i) => {
      this.clickSwap2(this.items[i]);
    });
    this.contextMenu = new ContextMenu();
    this.contextMenu.itemClick = deleteFunc;
    this.el = h('div', `${cssPrefix}-bottombar`).children(
      this.contextMenu.el,
      this.menuEl = h('ul', `${cssPrefix}-menu`).child(
        h('li', '').children(
          new Icon('add').on('click', () => {
            if (this.dataNames.length < 10) {
              addFunc();
            } else {
              xtoast('tip', 'it less than or equal to 10');
            }
          }),
          h('span', '').child(this.moreEl),
        ),
      ),
    );
  }

  addItem(data, active) {
    const { name } = data;
    this.dataNames.push(name);
    const item = h('li', active ? 'active' : '').child(name);
    item.on('click', () => {
      this.clickSwap2(item);
    }).on('contextmenu', (evt) => {
      const { offsetLeft, offsetHeight } = evt.target;
      this.contextMenu.setOffset({ left: offsetLeft, bottom: offsetHeight + 1 });
      this.deleteEl = item;
    });
    if (active) {
      this.clickSwap(item);
    }
    this.items.push(item);
    this.menuEl.child(item);
    this.moreEl.reset(this.dataNames);
  }

  deleteItem() {
    const { activeEl, deleteEl } = this;
    if (this.items.length > 1) {
      const index = this.items.findIndex(it => it === deleteEl);
      this.items.splice(index, 1);
      this.dataNames.splice(index, 1);
      this.menuEl.removeChild(deleteEl.el);
      if (activeEl === deleteEl) {
        const [f] = this.items;
        this.activeEl = f;
        this.activeEl.toggle();
      }
      return index;
    }
    return -1;
  }

  clickSwap2(item) {
    const index = this.items.findIndex(it => it === item);
    this.clickSwap(item);
    this.activeEl.toggle();
    this.swapFunc(index);
  }

  clickSwap(item) {
    if (this.activeEl !== null) {
      this.activeEl.toggle();
    }
    this.activeEl = item;
  }
}
