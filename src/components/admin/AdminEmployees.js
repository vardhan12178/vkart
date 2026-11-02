import React from "react";
import usePermission from "./usePermission";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import AdminToast from "./ui/AdminToast";
import ListPageHeader from "./ui/ListPageHeader";
import EmployeeCards from "./employees/EmployeeCards";
import EmployeeModal from "./employees/EmployeeModal";
import EmployeeTable from "./employees/EmployeeTable";
import EmployeesEmpty from "./employees/EmployeesEmpty";
import RevokeModal from "./employees/RevokeModal";
import useEmployees from "./employees/useEmployees";

export default function AdminEmployees() {
  const { adminRole: myRole, canWrite } = usePermission("employees");
  const e = useEmployees();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <AdminToast toast={e.toast} />

        <ListPageHeader
          title="Employees"
          subtitle="Manage admin panel access and permissions."
          onRefresh={e.refetch}
          refreshing={e.fetching}
          onCreate={canWrite ? e.openAdd : undefined}
          createLabel="Add Employee"
          createShortLabel="Employee"
        />

        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
          {e.loading ? (
            <div className="p-4 sm:p-6">
              <SkeletonRegion label="Loading employees">
                <TableSkeleton rows={3} cols={3} />
              </SkeletonRegion>
            </div>
          ) : e.employees.length === 0 ? (
            <EmployeesEmpty canWrite={canWrite} onAdd={e.openAdd} />
          ) : (
            <>
              <EmployeeTable
                employees={e.employees}
                canWrite={canWrite}
                myRole={myRole}
                onEdit={e.openEdit}
                onRevoke={e.askRevoke}
              />
              <EmployeeCards
                employees={e.employees}
                canWrite={canWrite}
                myRole={myRole}
                onEdit={e.openEdit}
                onRevoke={e.askRevoke}
              />
            </>
          )}
        </div>
      </div>

      {e.modalMode && (
        <EmployeeModal
          mode={e.modalMode}
          employee={e.editingEmployee}
          myRole={myRole}
          busy={e.saving}
          onClose={e.closeModal}
          onSubmit={e.submit}
        />
      )}

      {e.revokeTarget && (
        <RevokeModal
          employee={e.revokeTarget}
          pending={e.revoking}
          onCancel={e.cancelRevoke}
          onConfirm={e.confirmRevoke}
        />
      )}
    </div>
  );
}
