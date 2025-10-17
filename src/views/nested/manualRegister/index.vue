<template>
  <div class="app-container">
    <el-page-header @back="goBack" content="대사등록" class="mb-4" />

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" status-icon>
      <el-card class="mb-4">
        <template #header>
          <div class="card-header">대사작업 등록</div>
        </template>

        <el-form-item label="대사작업명" prop="manualName">
          <el-input v-model.trim="form.manualName" placeholder="예) [251015] PASS앱 상호대사" />
        </el-form-item>

        <el-form-item label="서비스명" prop="service">
          <el-input v-model.trim="form.service" placeholder="예) PASS앱" />
          <!-- <el-select v-model="form.service" placeholder="서비스 선택">
            <el-option label="첫번째 서비스" value="service_first" />
            <el-option label="두번째 서비스" value="service_second" />
          </el-select> -->
        </el-form-item>

        <el-form-item label="부서" prop="department">
          <el-input v-model.trim="form.department" placeholder="예) 인증서비스개발팀" />
        </el-form-item>

        <el-form-item label="담당자" prop="contact">
          <el-input v-model.trim="form.contact" placeholder="예) 홍길동" />
        </el-form-item>

        <el-form-item label="테이블건수" prop="tableCount">
          <el-input-number v-model="form.tableCount" :min="0" :max="9999" />
        </el-form-item>
      </el-card>

      <el-form-item>
        <el-space>
          <el-button type="primary" :loading="saving" @click="submit">등록</el-button>
          <el-button @click="reset">초기화</el-button>
        </el-space>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ManualRegister',
  data() {
    return {
      saving: false,
      form: {
        manualName: '',
        service: '',
        department: '',
        contact: '',
        tableCount: 1
      },
      rules: {
        manualName: [{ required: true, message: '대사명을 입력하세요', trigger: 'blur' }],
        service: [{ required: true, message: '서비스명을 선택하세요', trigger: 'blur' }],
        department: [{ required: true, message: '부서를 입력하세요', trigger: 'blur' }],
        contact: [{ required: true, message: '담당자를 입력하세요', trigger: 'blur' }],
        tableCount: [{ required: true, message: '테이블건수를 입력하세요', trigger: 'change' }]
      }
    }
  },
  methods: {
    async submit() {
      this.$refs.formRef.validate(async(valid) => {
        if (!valid) return
        try {
          this.saving = true
          const payload = { ...this.form }

          // 목업 딜레이 (API 연동 전)
          await new Promise(r => setTimeout(r, 500))
          this.$message.success('대사등록이 완료되었습니다.')
          this.$router && this.$router.push('/reconcile')
        } catch (e) {
          console.error(e)
          this.$message.error('대사등록 실패!')
        } finally {
          this.saving = false
        }
      })
    },
    reset() {
      this.$refs.formRef.resetFields()
    },
    goBack() {
      this.$router && this.$router.back()
    }
  }
}
</script>
