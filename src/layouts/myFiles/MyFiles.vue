<template>
    <div class="h-screen overflow-y-scroll w-full">
        <div class="bg-white p-8  m-2 h-fit rounded shadow-3xl">
            <DataTable :value="documentlists" tableStyle="min-width: 50rem">
                <template #empty>No records.</template>

                <Column field="entry.createdAt" header="Created Date">
                    <template #body="slotProps">
                        <div>{{ convertToReadableDate(slotProps.data.entry.createdAt) }}</div>
                    </template>
                </Column>
                <Column field="entry.name" header="File"></Column>
                <Column field="entry.content.mimeType" header="Content Type"></Column>
                <!-- <Column field="entry.content.mimeTypeName" header="Type Name"></Column> -->
                <Column field="entry.content.sizeInBytes" header="Size">
                    <template #body="slotProps">
                        <div>{{ bytesToMB(slotProps.data.entry.content.sizeInBytes) + "MB" }}</div>
                    </template>
                </Column>
                <!-- <Column field="entry.createdByUser.displayName" header="Username"></Column> -->
                <Column field="entry.id" header="Action">
                    <template #body="slotProps">
                        <span class="pi pi-eye text-primary" style="font-size: 1.3rem"
                            @click="changeModalVisibilty(slotProps?.data.entry.id)"></span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <Dialog v-model:visible="visible" header="Document View" :style="{ width: '75vw', backgroundColor: '#ffffff' }"
        position="center" :modal="true" :draggable="false" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="flex flex-col bg-slate-50 p-1">
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-3">
                    <div class="">
                        <p class="text-lg font-medium text-slate-500">Versions</p>
                    </div>
                    <div class="flex flex-col">
                        <span v-for="(data, index) in versionArray" :key="index" @click="getFileByVersion(data)"
                            class="cursor-pointer">
                            {{ data }}
                        </span>
                        <!-- {{this.versionsList}} -->
                    </div>
                </div>
                <div class="col-span-9 w-full" style="height: 75vh;">
                    <!-- <iframe :src="pdfUrl" style="width: 100%;height:100%;" sandbox="allow-same-origin"
                        referrerpolicy="no-referrer" /> -->
                    <iframe v-if="pdfValidation" :src="pdfUrl" width="100%" height="100%"
                        type="application/pdf"></iframe>
                    <div v-else>
                        No data Found.
                    </div>
                </div>

            </div>
        </div>
        <div class="flex gap-2 justify-end mt-3" v-if="tabvalue === 0">
            <div>
                <Button label="Reject" severity="danger" size="small" style="font-size: small;"
                    @click="this.onClickReject()" />
            </div>
            <div>
                <Button label="Approve" severity="success" size="small" style="font-size: small;"
                    @click="this.onClickAccept()" />
            </div>
        </div>
    </Dialog>
</template>

<script>
import endpoints from '@/services/endpoints';
import { httpClient } from '@/services/interceptor';
import convertToReadableDate from '@/utils/dataUtils';

export default {
    data() {
        return {
            pdfValidation: false,
            documentlists: null,
            pdfUrl: null,
            visible: false,
            versionsList: '',
            versionArray: [],
            docId: "",

        };
    },
    methods: {
        async getFileByVersion(versionId) {
            console.log(versionId, "versionId")
            const filterString = versionId.replace(',', '');
            console.log(filterString, "filterString")
            await httpClient.get(endpoints.getFileUsingVersion + `/${this.docId}/versions/${filterString}/content`, {
                auth: {
                    username: "admin",
                    password: "admin"
                },
                responseType: 'blob'
            }).then((res) => {
                const binaryString = res?.data;
                this.pdfUrl = window.URL.createObjectURL(binaryString);
                if (res.status === 200) {
                    this.pdfValidation = true
                    console.error('The file is valid PDF');
                } else {
                    this.pdfValidation = false
                    console.error('The file is not a valid PDF');
                }

                const blob = new Blob([res.data], { type: res.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            })

        },
        async changeModalVisibilty(documentId) {
            this.docId = documentId
            const res = await httpClient.get(`${endpoints.versions}/${documentId}/versions`, {
                auth: {
                    username: localStorage.getItem("userName"),
                    password: "admin"
                }
            })

            console.log(res.data?.list?.entries, "versions");
            const versionids = res.data?.list?.entries.map((data) => {
                return data.entry.id
            })
            console.log(versionids, "veriosnarr")
            this.versionArray = versionids.join(',\n').split('\n');


            // const tempVersion = res.data?.list?.entries[0].entry.id
            // this.versionsList=tempVersion
            // console.log(this.versionsList, "versionArray")
            await httpClient.get(`/alfresco/api/-default-/public/alfresco/versions/1/nodes/${documentId}/content`, {
                auth: {
                    username: "admin",
                    password: "admin"
                },
                responseType: 'blob'
            }).then((res) => {
                const binaryString = res?.data;
                this.pdfUrl = window.URL.createObjectURL(binaryString);
                console.log(this.pdfUrl, "pdf url")
                if (res.status === 200) {
                    this.pdfValidation = true
                    console.error('The file is valid PDF');
                } else {
                    this.pdfValidation = false
                    console.error('The file is not a valid PDF');
                }
            })
            this.visible = !this.visible;
        },

        bytesToMB(bytes) {
            const megabytes = bytes / (1024 * 1024);
            return megabytes.toFixed(2); // Returns the result rounded to 2 decimal places
        },
        convertToReadableDate,
        async getAllDocuments() {
            const docsList = await httpClient.get(`${endpoints.getDocuments}`, {
                auth: {
                    username: localStorage.getItem("userName"),
                    password: "admin"
                }
            });
            const unFilteredData = docsList.data.list.entries
            console.log(unFilteredData, 'unFilteredData')
            const filteredData = unFilteredData.filter((data) => data && data.entry && data.entry.isFile === true)
            console.log(filteredData, "docsList");

            this.documentlists = filteredData
        }
    },
    mounted() {
        this.getAllDocuments();
    }
};
</script>
