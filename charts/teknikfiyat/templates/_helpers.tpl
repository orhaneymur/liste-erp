{{/*
Kaynak adları TÜM müşterilerde bilerek AYNI tutulur — ERP chart'ındaki
kalıbın aynısı. Namespace'ler yalıtık olduğu için çakışma olmaz.
*/}}

{{- define "teknikfiyat.name" -}}teknikfiyat{{- end -}}
{{- define "teknikfiyat.configName" -}}teknikfiyat-config{{- end -}}

{{/*
Sitenin alan adı.
ingress.host açıkça verilmişse o kullanılır (müşterinin kendi alan adı,
ör. liste.shenzhenmarket.com.tr); yoksa <id><suffix>.<base> kalıbından
üretilir  ->  shenzhen + "-liste" + "derneklab.com"
*/}}
{{- define "teknikfiyat.host" -}}
{{- if .Values.ingress.host -}}
{{- .Values.ingress.host -}}
{{- else -}}
{{- printf "%s%s.%s" (required "tenant.id zorunludur (--set tenant.id=shenzhen)" .Values.tenant.id) (.Values.domain.tenantSuffix | default "") .Values.domain.base -}}
{{- end -}}
{{- end -}}

{{- define "teknikfiyat.image" -}}
{{- printf "%s/%s:%s" .Values.image.registry .Values.image.repository .Values.image.tag -}}
{{- end -}}

{{/* Her kaynağa basılan ortak etiketler */}}
{{- define "teknikfiyat.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: teknikfiyat
teknikfiyat.io/tenant: {{ .Values.tenant.id | quote }}
{{- end -}}
