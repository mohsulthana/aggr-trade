<template>
  <dropdown :options="presets" @output="onSelect" class="mrauto">
    <template v-slot:selection>
      <button class="btn -text ml0" type="button">{{ title }} <i class="icon-down ml4"></i></button>
    </template>
    <template v-slot:option="{ value }">
      <div>
        <i :class="'-lower icon-' + value.icon"></i>

        <span>{{ value.label }}</span>

        <i v-if="value.id" class="icon-trash -action mr16 -lower" @click.stop="removePreset(value.id)"></i>
      </div>
    </template>
  </dropdown>
</template>

<script lang="ts">
import dialogService from '@/services/dialogService'
import workspacesService from '@/services/workspacesService'
import { PresetType } from '@/types/test'
import { Component, Vue } from 'vue-property-decorator'
import Dropdown from '@/components/framework/Dropdown.vue'

@Component({
  components: { Dropdown },
  props: {
    type: {
      required: true
    },
    adapter: {
      required: true
    },
    title: {
      default: 'Presets'
    }
  }
})
export default class extends Vue {
  type: PresetType
  adapter: Function

  presets = [
    {
      icon: 'plus',
      label: 'Save as',
      click: this.savePreset
    },
    {
      icon: 'warning',
      label: 'Apply default',
      click: this.applyDefault
    }
  ] as any

  created() {
    this.getPresets()
  }

  async getPresets() {
    this.presets.splice(2, this.presets.length)

    const keys = (await workspacesService.getPresetsKeysByType(this.type)) as string[]

    for (let i = 0; i < keys.length; i++) {
      this.presets.push({
        id: keys[i],
        label: keys[i]
          .split(':')
          .slice(1)
          .join(':')
      })
    }
  }

  async onSelect(index) {
    if (typeof this.presets[index].click === 'function') {
      return
    }

    const preset = await workspacesService.getPreset(this.presets[index].id)

    this.$emit('apply', preset.data)
  }

  async savePreset() {
    const name = await dialogService.prompt('Enter a name')

    if (!name) {
      return
    }

    const data = await this.adapter()

    if (!data) {
      this.$store.dispatch('app/showNotice', {
        type: 'error',
        title: `Preset should contain data. Not saving this preset.`
      })

      return
    }

    await workspacesService.savePreset({
      name: this.type + ':' + name,
      type: this.type,
      data
    })

    await this.getPresets()
  }

  async applyDefault() {
    if (await dialogService.confirm('Reset ' + this.type + ' to default settings ?')) {
      this.$emit('apply')
    }
  }

  async removePreset(id) {
    await workspacesService.removePreset(id)

    await this.getPresets()
  }
}
</script>