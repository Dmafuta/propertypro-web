using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FacilityApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAppRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "public",
                table: "AspNetRoles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "public",
                table: "AspNetRoles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "public",
                table: "AspNetRoles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystem",
                schema: "public",
                table: "AspNetRoles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<List<int>>(
                name: "Permissions",
                schema: "public",
                table: "AspNetRoles",
                type: "integer[]",
                nullable: false,
                defaultValueSql: "'{}'::integer[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "public",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "public",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "public",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "IsSystem",
                schema: "public",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "Permissions",
                schema: "public",
                table: "AspNetRoles");
        }
    }
}
